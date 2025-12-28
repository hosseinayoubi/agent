export * from "./models/auth";
export * from "./models/chat";

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Linked manually to users.id (which is varchar)
  cvFileUrl: text("cv_file_url"),
  linkedinUrl: text("linkedin_url"),
  parsedSkills: jsonb("parsed_skills").$type<string[]>(),
  experienceLevel: text("experience_level"),
  targetLocation: text("target_location"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name").notNull(),
  matchPercentage: integer("match_percentage"), // Store as 0-100
  jobUrl: text("job_url"),
  appliedAt: timestamp("applied_at").defaultNow(),
  customCvUrl: text("custom_cv_url"),
  coverLetterUrl: text("cover_letter_url"),
  description: text("description"), // Job description
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, updatedAt: true });
export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, appliedAt: true });

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

// Relations
// Note: relations definitions here are logical for Drizzle query builder
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));
