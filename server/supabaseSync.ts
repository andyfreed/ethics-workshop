import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';
import { ChapterRequest, insertChapterRequestSchema } from '@shared/schema';

// Initialize Supabase server-side client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are missing or invalid. Syncing will be disabled.');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Sync functions for chapter requests
export async function syncChapterRequestToSupabase(request: ChapterRequest): Promise<void> {
  if (!supabase) {
    console.warn('Supabase client not available. Skipping sync.');
    return;
  }

  try {
    const { error } = await supabase
      .from('chapter_requests')
      .upsert({
        id: request.id,
        chapter_name: request.chapterName,
        contact_person: request.contactPerson,
        email: request.email,
        phone: request.phone,
        preferred_date: request.preferredDate,
        alternate_date: request.alternateDate,
        estimated_attendees: request.estimatedAttendees,
        instructor_name: request.instructorName,
        additional_info: request.additionalInfo,
        status: request.status,
        created_at: request.createdAt
      });

    if (error) {
      console.error('Error syncing to Supabase:', error);
    } else {
      console.log(`Successfully synced chapter request ${request.id} to Supabase`);
    }
  } catch (err) {
    console.error('Exception during Supabase sync:', err);
  }
}

// Utility function to sync all data to Supabase
export async function syncAllDataToSupabase() {
  if (!supabase) {
    console.warn('Supabase client not available. Skipping sync.');
    return;
  }

  try {
    // Sync chapter requests
    const chapterRequests = await storage.getChapterRequests();
    for (const request of chapterRequests) {
      await syncChapterRequestToSupabase(request);
    }
    
    console.log('Data sync to Supabase completed');
  } catch (err) {
    console.error('Error in sync all data to Supabase:', err);
  }
}