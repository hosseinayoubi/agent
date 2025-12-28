import { z } from 'zod';
import { insertUserProfileSchema, insertJobApplicationSchema, userProfiles, jobApplications } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile',
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/profile',
      input: insertUserProfileSchema.partial(),
      responses: {
        200: z.custom<typeof userProfiles.$inferSelect>(),
      },
    },
  },
  jobs: {
    search: {
      method: 'POST' as const,
      path: '/api/jobs/search',
      input: z.object({ query: z.string(), location: z.string() }),
      responses: {
        200: z.array(z.object({
          title: z.string(),
          company: z.string(),
          location: z.string(),
          description: z.string(),
          url: z.string(),
          logo: z.string().optional(),
          date: z.string().optional(),
        })),
      },
    },
    match: {
        method: 'POST' as const,
        path: '/api/jobs/match',
        input: z.object({ jobDescription: z.string() }), 
        responses: {
            200: z.object({
                matchPercentage: z.number(),
                matchingSkills: z.array(z.string()),
                missingSkills: z.array(z.string()),
                analysis: z.string()
            })
        }
    },
    generate: {
        method: 'POST' as const,
        path: '/api/jobs/generate',
        input: z.object({ jobDescription: z.string(), jobTitle: z.string(), companyName: z.string() }),
        responses: {
            200: z.object({
                customCv: z.string(),
                coverLetter: z.string()
            })
        }
    },
    save: {
      method: 'POST' as const,
      path: '/api/jobs/save',
      input: insertJobApplicationSchema,
      responses: {
        201: z.custom<typeof jobApplications.$inferSelect>(),
      },
    },
    listSaved: {
      method: 'GET' as const,
      path: '/api/jobs/saved',
      responses: {
        200: z.array(z.custom<typeof jobApplications.$inferSelect>()),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
