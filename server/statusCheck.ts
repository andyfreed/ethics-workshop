import { supabase } from './supabaseSync';
import { pool } from './db';

export interface DatabaseStatus {
  local: {
    available: boolean;
    error?: string;
  };
  supabase: {
    available: boolean;
    error?: string;
    url?: string;
  };
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    local: { available: false },
    supabase: { available: false }
  };

  // Check local PostgreSQL connection
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as connected');
    if (result.rows[0]?.connected === 1) {
      status.local.available = true;
    }
    client.release();
  } catch (error) {
    status.local.error = error instanceof Error ? error.message : 'Unknown error';
    console.error('Local database connection error:', error);
  }

  // Check Supabase connection
  if (supabase) {
    try {
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
  console.log(`Local PostgreSQL: ${status.local.available ? 'CONNECTED ✓' : 'UNAVAILABLE ✗'}`);
  if (status.local.error) {
    console.log(`  Error: ${status.local.error}`);
  }
  
  console.log(`Supabase: ${status.supabase.available ? 'CONNECTED ✓' : 'UNAVAILABLE ✗'}`);
  if (status.supabase.url) {
    console.log(`  URL: ${status.supabase.url}`);
  }
  if (status.supabase.error) {
    console.log(`  Error: ${status.supabase.error}`);
  }
  
  console.log('===========================');
}