import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Profile Routes
  app.get(api.profile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getUserProfile(userId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.post(api.profile.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.profile.update.input.parse(req.body);
      
      const profile = await storage.upsertUserProfile({
        ...input,
        userId: userId,
      });
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Job Search Route (Mocked for now as we might not have Serper key)
  app.post(api.jobs.search.path, isAuthenticated, async (req, res) => {
    try {
        const input = api.jobs.search.input.parse(req.body);
        
        // Mock results or use Serper if available
        const jobs = [
            {
                title: "Software Engineer",
                company: "Tech Corp",
                location: input.location || "Remote",
                description: "We are looking for a software engineer with React and Node.js experience.",
                url: "https://example.com/job/1",
                date: "2 days ago"
            },
            {
                title: "Frontend Developer",
                company: "Creative Agency",
                location: input.location || "New York",
                description: "Join our team to build beautiful interfaces.",
                url: "https://example.com/job/2",
                date: "1 day ago"
            }
        ];
        
        // If Serper key exists, implementation would go here (fetch from https://google.serper.dev/search)
        
        res.json(jobs);
    } catch (err) {
        res.status(400).json({ message: "Invalid search parameters" });
    }
  });

  // Match Route
  app.post(api.jobs.match.path, isAuthenticated, async (req: any, res) => {
      try {
          const userId = req.user.claims.sub;
          const input = api.jobs.match.input.parse(req.body);
          const profile = await storage.getUserProfile(userId);

          if (!profile) {
              return res.status(400).json({ message: "Complete your profile first" });
          }

          // AI Match
          const prompt = `
          Analyze the fit between this candidate and the job.
          
          Candidate Skills: ${JSON.stringify(profile.parsedSkills || [])}
          Candidate Experience: ${profile.experienceLevel || "Not specified"}
          
          Job Description:
          ${input.jobDescription}
          
          Return JSON: { matchPercentage: number (0-100), matchingSkills: string[], missingSkills: string[], analysis: string }
          `;

          const response = await openai.chat.completions.create({
              model: "gpt-5.1",
              messages: [{ role: "user", content: prompt }],
              response_format: { type: "json_object" },
          });

          const result = JSON.parse(response.choices[0].message.content || "{}");
          res.json(result);

      } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Failed to match job" });
      }
  });

  // Generate Materials Route
  app.post(api.jobs.generate.path, isAuthenticated, async (req: any, res) => {
      try {
          const userId = req.user.claims.sub;
          const input = api.jobs.generate.input.parse(req.body);
          const profile = await storage.getUserProfile(userId);

          if (!profile) {
              return res.status(400).json({ message: "Complete your profile first" });
          }

          const prompt = `
          Generate a custom CV summary and cover letter for this job application.
          
          Candidate: ${req.user.claims.first_name} ${req.user.claims.last_name}
          Skills: ${JSON.stringify(profile.parsedSkills || [])}
          
          Job: ${input.jobTitle} at ${input.companyName}
          Description: ${input.jobDescription}
          
          Return JSON: { customCv: string (markdown), coverLetter: string (markdown) }
          `;

          const response = await openai.chat.completions.create({
              model: "gpt-5.1",
              messages: [{ role: "user", content: prompt }],
              response_format: { type: "json_object" },
          });

          const result = JSON.parse(response.choices[0].message.content || "{}");
          res.json(result);

      } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Failed to generate materials" });
      }
  });

  // Save Job Route
  app.post(api.jobs.save.path, isAuthenticated, async (req: any, res) => {
      try {
          const userId = req.user.claims.sub;
          const input = api.jobs.save.input.parse(req.body);
          
          const saved = await storage.saveJobApplication({
              ...input,
              userId: userId
          });
          res.status(201).json(saved);
      } catch (err) {
          if (err instanceof z.ZodError) {
            return res.status(400).json({
              message: err.errors[0].message,
              field: err.errors[0].path.join('.'),
            });
          }
          res.status(500).json({ message: "Failed to save job" });
      }
  });

  app.get(api.jobs.listSaved.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const jobs = await storage.getSavedJobs(userId);
      res.json(jobs);
  });

  return httpServer;
}
