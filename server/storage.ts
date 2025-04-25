import { 
  User, InsertUser, 
  ChapterRequest, InsertChapterRequest,
  WorkshopSession, InsertWorkshopSession,
  Participant, InsertParticipant
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chapterRequests: Map<number, ChapterRequest>;
  private workshopSessions: Map<number, WorkshopSession>;
  private participants: Map<number, Participant>;
  
  private currentUserId: number;
  private currentRequestId: number;
  private currentSessionId: number;
  private currentParticipantId: number;

  constructor() {
    this.users = new Map();
    this.chapterRequests = new Map();
    this.workshopSessions = new Map();
    this.participants = new Map();
    
    this.currentUserId = 1;
    this.currentRequestId = 1;
    this.currentSessionId = 1;
    this.currentParticipantId = 1;
    
    // Add admin user by default
    this.createUser({
      username: "admin",
      password: "password",
      isAdmin: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Chapter Request methods
  async getChapterRequests(): Promise<ChapterRequest[]> {
    return Array.from(this.chapterRequests.values());
  }
  
  async getChapterRequestById(id: number): Promise<ChapterRequest | undefined> {
    return this.chapterRequests.get(id);
  }
  
  async createChapterRequest(request: InsertChapterRequest): Promise<ChapterRequest> {
    const id = this.currentRequestId++;
    const now = new Date();
    const chapterRequest: ChapterRequest = { 
      ...request, 
      id, 
      status: "pending", 
      createdAt: now 
    };
    this.chapterRequests.set(id, chapterRequest);
    return chapterRequest;
  }
  
  async updateChapterRequestStatus(id: number, status: string): Promise<ChapterRequest | undefined> {
    const request = this.chapterRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status };
    this.chapterRequests.set(id, updatedRequest);
    return updatedRequest;
  }
  
  // Workshop Session methods
  async getWorkshopSessions(): Promise<WorkshopSession[]> {
    return Array.from(this.workshopSessions.values());
  }
  
  async getWorkshopSessionById(id: number): Promise<WorkshopSession | undefined> {
    return this.workshopSessions.get(id);
  }
  
  async createWorkshopSession(session: InsertWorkshopSession): Promise<WorkshopSession> {
    const id = this.currentSessionId++;
    const now = new Date();
    const workshopSession: WorkshopSession = { 
      ...session, 
      id, 
      status: "upcoming", 
      reportedToCfpBoard: false, 
      createdAt: now 
    };
    this.workshopSessions.set(id, workshopSession);
    return workshopSession;
  }
  
  async updateWorkshopSessionStatus(id: number, status: string): Promise<WorkshopSession | undefined> {
    const session = this.workshopSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, status };
    this.workshopSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async markWorkshopSessionReported(id: number, reported: boolean): Promise<WorkshopSession | undefined> {
    const session = this.workshopSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, reportedToCfpBoard: reported };
    this.workshopSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Participant methods
  async getParticipants(): Promise<Participant[]> {
    return Array.from(this.participants.values());
  }
  
  async getParticipantsBySessionId(sessionId: number): Promise<Participant[]> {
    return Array.from(this.participants.values()).filter(
      (participant) => participant.sessionId === sessionId
    );
  }
  
  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const id = this.currentParticipantId++;
    const now = new Date();
    const newParticipant: Participant = { 
      ...participant, 
      id, 
      reportedToCfpBoard: false, 
      createdAt: now 
    };
    this.participants.set(id, newParticipant);
    return newParticipant;
  }
  
  async markParticipantsReported(ids: number[]): Promise<number> {
    let count = 0;
    
    ids.forEach(id => {
      const participant = this.participants.get(id);
      if (participant) {
        const updatedParticipant = { ...participant, reportedToCfpBoard: true };
        this.participants.set(id, updatedParticipant);
        count++;
      }
    });
    
    return count;
  }
  
  async getParticipantById(id: number): Promise<Participant | undefined> {
    return this.participants.get(id);
  }
}

export const storage = new MemStorage();
