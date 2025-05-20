import { supabase } from './supabaseSync';

export interface DatabaseStatus {
  supabase: {
    available: boolean;
    error?: string;
    url?: string;
  };
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    supabase: { available: false }
  };

  // Check Supabase connection
  if (supabase) {
    try {
      // For development mode without Supabase, skip the actual connection attempt
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment && (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)) {
        status.supabase.available = false;
        status.supabase.error = 'Supabase credentials not configured. Please set up Supabase environment variables.';
      } else {
        const { error } = await supabase.from('chapter_requests').select('count', { count: 'exact', head: true });
        
        // Set URL (hide most of it for security)
        const supabaseUrl = process.env.SUPABASE_URL || '';
        if (supabaseUrl) {
          status.supabase.url = `${supabaseUrl.substring(0, 15)}...`;
        }
        
        if (error) {
          status.supabase.error = error.message;
          status.supabase.available = false;
        } else {
          status.supabase.available = true;
        }
      }
    } catch (error) {
      status.supabase.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('Supabase connection error:', error);
    }
  } else {
    status.supabase.error = 'Supabase client not initialized';
  }

  return status;
}

// Helper function to log a formatted summary of the database status
export function logDatabaseStatus(status: DatabaseStatus): void {
  console.log('====== DATABASE STATUS ======');
  
  console.log(`Supabase: ${status.supabase.available ? 'CONNECTED ✓' : 'UNAVAILABLE ✗'}`);
  if (status.supabase.url) {
    console.log(`  URL: ${status.supabase.url}`);
  }
  if (status.supabase.error) {
    console.log(`  Error: ${status.supabase.error}`);
  }
  
  console.log('===========================');
}