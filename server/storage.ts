import { db } from "./db";
import {
  userProfiles,
  jobApplications,
  type UserProfile,
  type InsertUserProfile,
  type JobApplication,
  type InsertJobApplication,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  saveJobApplication(app: InsertJobApplication): Promise<JobApplication>;
  getSavedJobs(userId: string): Promise<JobApplication[]>;
}

export class DatabaseStorage implements IStorage {
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, profile.userId));

    if (existing) {
      const [updated] = await db
        .update(userProfiles)
        .set({ ...profile, updatedAt: new Date() })
        .where(eq(userProfiles.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProfiles)
        .values(profile)
        .returning();
      return created;
    }
  }

  async saveJobApplication(app: InsertJobApplication): Promise<JobApplication> {
    const [saved] = await db
      .insert(jobApplications)
      .values(app)
      .returning();
    return saved;
  }

  async getSavedJobs(userId: string): Promise<JobApplication[]> {
    return db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.appliedAt));
  }
}

export const storage = new DatabaseStorage();
