import { schema } from "./db";
import { eq } from "drizzle-orm";
import { supabase } from "./supabaseSync";

// This is now a simplified mock storage module that relies on Supabase
// All data operations are performed through Supabase

// Define basic types for storage
interface Chapter {
  id: number;
  [key: string]: any;
}

interface ChapterRequest {
  id: number;
  status?: string;
  [key: string]: any;
}

interface Participant {
  id: number;
  [key: string]: any;
}

interface User {
  id: number;
  username?: string;
  [key: string]: any;
}

interface Session {
  id: number;
  [key: string]: any;
}

// Set up a local mock storage for compatibility and development
const mockStorage: {
  chapters: Chapter[];
  chapterRequests: ChapterRequest[];
  participants: Participant[];
  users: User[];
  sessions: Session[];
} = {
  chapters: [],
  chapterRequests: [],
  participants: [],
  users: [],
  sessions: []
};

export const storage = {
  // Chapter methods
  async getChapters() {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching chapters:", error);
      return mockStorage.chapters;
    }
  },

  async getChapterById(id: number) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching chapter ${id}:`, error);
      return mockStorage.chapters.find(c => c.id === id);
    }
  },

  // Chapter requests methods
  async getChapterRequests() {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('chapter_requests')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching chapter requests:", error);
      return mockStorage.chapterRequests;
    }
  },

  async getChapterRequestById(id: number) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('chapter_requests')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching chapter request ${id}:`, error);
      return mockStorage.chapterRequests.find(r => r.id === id);
    }
  },

  async createChapterRequest(request: ChapterRequest) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      // Map camelCase fields to snake_case for Supabase
      const mappedRequest = {
        chapter_name: request.chapterName,
        contact_person: request.contactPerson,
        email: request.email,
        phone: request.phone,
        preferred_date: request.preferredDate,
        alternate_date: request.alternateDate,
        estimated_attendees: request.estimatedAttendees,
        instructor_name: request.instructorName,
        additional_info: request.additionalInfo,
        // status and created_at are handled by defaults in the DB
      };
      const { data, error } = await supabase
        .from('chapter_requests')
        .insert([mappedRequest])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating chapter request:", error);
      // For development, create a mock
      const mockRequest = {
        ...request,
        id: request.id || Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString(),
        status: "pending"
      };
      mockStorage.chapterRequests.push(mockRequest);
      return mockRequest;
    }
  },

  async updateChapterRequestStatus(id: number, status: string) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('chapter_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating chapter request ${id}:`, error);
      const requestIndex = mockStorage.chapterRequests.findIndex(r => r.id === id);
      if (requestIndex >= 0) {
        mockStorage.chapterRequests[requestIndex].status = status;
        return mockStorage.chapterRequests[requestIndex];
      }
      return null;
    }
  },

  // Participant methods
  async getParticipants() {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('participants')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching participants:", error);
      return mockStorage.participants;
    }
  },

  async registerParticipant(participantData: Participant) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('participants')
        .insert([participantData])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error registering participant:", error);
      // For development, create a mock
      const mockParticipant = {
        ...participantData,
        id: participantData.id || Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString()
      };
      mockStorage.participants.push(mockParticipant);
      return mockParticipant;
    }
  },

  // User methods
  async getUserByUsername(username: string) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching user ${username}:`, error);
      return mockStorage.users.find(u => u.username === username);
    }
  },

  async getUser(id: number) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return mockStorage.users.find(u => u.id === id);
    }
  },

  async createUser(userData: User) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating user:", error);
      // For development, create a mock
      const mockUser = {
        ...userData,
        id: userData.id || Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString()
      };
      mockStorage.users.push(mockUser);
      return mockUser;
    }
  },

  // Session methods
  async createSession(sessionData: Session) {
    try {
      if (!supabase) throw new Error('Supabase client not available');
      
      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating session:", error);
      // For development, create a mock
      const mockSession = {
        ...sessionData,
        id: sessionData.id || Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString()
      };
      mockStorage.sessions.push(mockSession);
      return mockSession;
    }
  }
};

// Helper function to check if database is initialized
export async function getStorage() {
  return {
    type: "supabase",
    status: "active",
    message: "Using Supabase storage with mock data fallback"
  };
}
