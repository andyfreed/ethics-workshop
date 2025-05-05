import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with new credentials
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; // Using service role key for admin operations

console.log('Initializing Supabase client with service role key');
if (supabaseUrl) {
  console.log(`Connecting to Supabase at: ${supabaseUrl.substring(0, 20)}...`);
}

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: Supabase credentials are missing. Will skip Supabase initialization.');
  // Continue without Supabase - don't exit the process
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initializeSupabase() {
  // Skip if credentials are missing
  if (!supabaseUrl || !supabaseKey) {
    console.log('Skipping Supabase initialization due to missing credentials');
    return;
  }
  
  try {
    // First test the connection
    try {
      const { data, error } = await supabase.from('_dummy_test_').select('*').limit(1).maybeSingle();
      if (error && !error.message.includes('does not exist')) {
        // This is a connection error, not just a missing table error
        throw new Error(`Supabase connection test failed: ${error.message}`);
      }
    } catch (connectionErr) {
      console.error('Supabase connection failed:', connectionErr);
      console.log('Application will continue using local database only');
      return; // Exit early but don't crash the application
    }

    // If we got here, connection was successful
    
    // Read the SQL setup file
    const sqlFilePath = path.join(process.cwd(), 'supabase_setup.sql');
    if (!fs.existsSync(sqlFilePath)) {
      console.warn('Supabase setup SQL file not found at:', sqlFilePath);
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('Executing SQL setup script...');
    
    // Execute the SQL statements
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_string: sqlContent });
      
      if (error) {
        console.error('Error executing SQL setup:', error);
        // Try direct SQL execution as fallback
        console.log('Attempting alternative setup method...');
        
        // Split the SQL into individual statements and execute them separately
        const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql_string: statement });
            if (error) {
              console.warn(`Warning: Could not execute statement: ${statement.substring(0, 50)}...`, error);
            } else {
              console.log(`Successfully executed: ${statement.substring(0, 50)}...`);
            }
          } catch (stmtErr) {
            console.warn(`Exception executing statement: ${statement.substring(0, 50)}...`, stmtErr);
          }
        }
      } else {
        console.log('Successfully executed SQL setup script.');
      }
    } catch (sqlError) {
      console.error('Failed to execute SQL setup:', sqlError);
    }
    
    // Verify the tables were created
    try {
      const { data: tables, error: listError } = await supabase
        .from('chapter_requests')
        .select('id')
        .limit(1);
        
      if (listError) {
        console.warn('Warning: Could not verify tables were created:', listError);
      } else {
        console.log('Database setup verified successfully.');
      }
    } catch (verifyError) {
      console.error('Failed to verify database setup:', verifyError);
    }
    
    console.log('Supabase setup completed.');
  } catch (err) {
    console.error('Error during Supabase initialization:', err);
    console.log('Application will continue using local database only');
  }
}

// Run initialization but don't crash the app if it fails
initializeSupabase().catch(err => {
  console.error('Unhandled error in Supabase initialization:', err);
  console.log('Application will continue using local database only');
});