import { 
  User, InsertUser, 
  ChapterRequest, InsertChapterRequest,
  WorkshopSession, InsertWorkshopSession,
  Participant, InsertParticipant,
  users, chapterRequests, workshopSessions, participants
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chapter Request methods
  getChapterRequests(): Promise<ChapterRequest[]>;
  getChapterRequestById(id: number): Promise<ChapterRequest | undefined>;
  createChapterRequest(request: InsertChapterRequest): Promise<ChapterRequest>;
  updateChapterRequestStatus(id: number, status: string): Promise<ChapterRequest | undefined>;
  
  // Workshop Session methods
  getWorkshopSessions(): Promise<WorkshopSession[]>;
  getWorkshopSessionById(id: number): Promise<WorkshopSession | undefined>;
  createWorkshopSession(session: InsertWorkshopSession): Promise<WorkshopSession>;
  updateWorkshopSessionStatus(id: number, status: string): Promise<WorkshopSession | undefined>;
  markWorkshopSessionReported(id: number, reported: boolean): Promise<WorkshopSession | undefined>;
  
  // Participant methods
  getParticipants(): Promise<Participant[]>;
  getParticipantsBySessionId(sessionId: number): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  markParticipantsReported(ids: number[]): Promise<number>;
  getParticipantById(id: number): Promise<Participant | undefined>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Chapter Request methods
  async getChapterRequests(): Promise<ChapterRequest[]> {
    return await db.select().from(chapterRequests);
  }
  
  async getChapterRequestById(id: number): Promise<ChapterRequest | undefined> {
    const result = await db.select().from(chapterRequests).where(eq(chapterRequests.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createChapterRequest(request: InsertChapterRequest): Promise<ChapterRequest> {
    const result = await db.insert(chapterRequests)
      .values({
        ...request,
        status: "pending",
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }
  
  async updateChapterRequestStatus(id: number, status: string): Promise<ChapterRequest | undefined> {
    const result = await db.update(chapterRequests)
      .set({ status })
      .where(eq(chapterRequests.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  // Workshop Session methods
  async getWorkshopSessions(): Promise<WorkshopSession[]> {
    return await db.select().from(workshopSessions);
  }
  
  async getWorkshopSessionById(id: number): Promise<WorkshopSession | undefined> {
    const result = await db.select().from(workshopSessions).where(eq(workshopSessions.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createWorkshopSession(session: InsertWorkshopSession): Promise<WorkshopSession> {
    const result = await db.insert(workshopSessions)
      .values({
        ...session,
        status: "upcoming",
        reportedToCfpBoard: false,
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }
  
  async updateWorkshopSessionStatus(id: number, status: string): Promise<WorkshopSession | undefined> {
    const result = await db.update(workshopSessions)
      .set({ status })
      .where(eq(workshopSessions.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async markWorkshopSessionReported(id: number, reported: boolean): Promise<WorkshopSession | undefined> {
    const result = await db.update(workshopSessions)
      .set({ reportedToCfpBoard: reported })
      .where(eq(workshopSessions.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  // Participant methods
  async getParticipants(): Promise<Participant[]> {
    return await db.select().from(participants);
  }
  
  async getParticipantsBySessionId(sessionId: number): Promise<Participant[]> {
    return await db.select().from(participants).where(eq(participants.sessionId, sessionId));
  }
  
  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const result = await db.insert(participants)
      .values({
        ...participant,
        reportedToCfpBoard: false,
        createdAt: new Date()
      })
      .returning();
    return result[0];
  }
  
  async markParticipantsReported(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    
    // Update participants where id is in the ids array
    const result = await db.update(participants)
      .set({ reportedToCfpBoard: true })
      .where(
        ids.map(id => eq(participants.id, id)).reduce((prev, curr) => or(prev, curr))
      )
      .returning();
    
    return result.length;
  }
  
  async getParticipantById(id: number): Promise<Participant | undefined> {
    const result = await db.select().from(participants).where(eq(participants.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
}

// Initialize admin user if it doesn't exist
async function initializeDatabase() {
  const adminCheck = await db.select().from(users).where(eq(users.username, "admin"));
  
  if (adminCheck.length === 0) {
    await db.insert(users).values({
      username: "admin",
      password: "password", // Note: In production, use password hashing
      isAdmin: true
    });
    console.log("Admin user created successfully");
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
initializeDatabase().catch(err => {
  console.error("Failed to initialize database:", err);
});
