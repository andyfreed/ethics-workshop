import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';
import { ChapterRequest, insertChapterRequestSchema } from '@shared/schema';

// Initialize Supabase server-side client
const supabaseUrl = process.env.SUPABASE_URL || "";
// Try to use service role key first (with more permissions), fall back to anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are missing or invalid. Syncing will be disabled.');
}

// Log which key we're using (without revealing the actual key)
if (supabaseUrl && supabaseKey) {
  console.log(`Initializing Supabase client with ${supabaseServiceKey ? 'service role' : 'anon'} key`);
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Sync functions for chapter requests
export async function syncChapterRequestToSupabase(request: ChapterRequest): Promise<void> {
  if (!supabase) {
    console.warn('Supabase client not available. Skipping sync.');
    return;
  }

  try {
    console.log('Attempting to sync chapter request:', request.id);
    
    // First check if the table exists in Supabase
    const { error: tableCheckError } = await supabase
      .from('chapter_requests')
      .select('id')
      .limit(1);
      
    if (tableCheckError) {
      console.error('Table check error - chapter_requests may not exist in Supabase:', tableCheckError);
      
      // Try to create the table if it doesn't exist
      try {
        console.log('Attempting to create chapter_requests table in Supabase');
        // Note: In Supabase, we need to create the table through SQL or the admin panel
        // This is just a placeholder to show the intent
        console.log('Supabase requires table creation through the admin UI or migrations');
      } catch (createErr) {
        console.error('Error trying to create table:', createErr);
      }
      return;
    }
    
    // If table exists, proceed with the upsert
    const dataToSync = {
      id: request.id,
      chapter_name: request.chapterName,
      contact_person: request.contactPerson,
      email: request.email,
      phone: request.phone || null,
      preferred_date: request.preferredDate ? new Date(request.preferredDate).toISOString() : null,
      alternate_date: request.alternateDate ? new Date(request.alternateDate).toISOString() : null,
      estimated_attendees: request.estimatedAttendees,
      instructor_name: request.instructorName,
      additional_info: request.additionalInfo || null,
      status: request.status,
      created_at: request.createdAt ? new Date(request.createdAt).toISOString() : new Date().toISOString()
    };
    
    console.log('Syncing data to Supabase:', dataToSync);
    
    const { error } = await supabase
      .from('chapter_requests')
      .upsert(dataToSync);

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
    console.log('Starting data sync to Supabase...');
    
    // Check Supabase connection first
    try {
      const { error: connectionError } = await supabase.from('chapter_requests').select('count', { count: 'exact', head: true });
      if (connectionError) {
        console.error('Supabase connection error:', {
          message: connectionError.message,
          details: connectionError.details,
          hint: connectionError.hint,
          code: connectionError.code
        });
        
        // If connection error indicates the table doesn't exist, try to create it
        if (connectionError.code === '42P01' || // PostgreSQL "relation does not exist"
            connectionError.message.includes('does not exist') ||
            connectionError.message.includes('not found') ||
            connectionError.message.includes('undefined')) {
          console.log('Tables may not exist. We will continue with local storage only.');
        }
        return;
      }
      console.log('Supabase connection successful');
    } catch (connErr) {
      console.error('Supabase connection error:', {
        message: connErr instanceof Error ? connErr.message : 'Unknown error',
        details: connErr instanceof Error ? connErr.stack : connErr,
        hint: '',
        code: ''
      });
      return;
    }
    
    // Sync chapter requests
    console.log('Fetching chapter requests from local database...');
    const chapterRequests = await storage.getChapterRequests();
    console.log(`Found ${chapterRequests.length} chapter requests to sync`);
    
    if (chapterRequests.length === 0) {
      console.log('No chapter requests to sync');
    } else {
      for (const request of chapterRequests) {
        console.log(`Syncing chapter request ID: ${request.id}`);
        await syncChapterRequestToSupabase(request);
      }
    }
    
    console.log('Data sync to Supabase completed');
  } catch (err) {
    console.error('Error in sync all data to Supabase:', err);
    // Print the full error details
    if (err instanceof Error) {
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
    } else {
      console.error('Unknown error type:', err);
    }
  }
}