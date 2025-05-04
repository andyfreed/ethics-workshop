import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client with new credentials
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; // Using service role key for admin operations

console.log('Initializing Supabase setup...');

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Supabase credentials are missing. Cannot initialize database.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initializeSupabase() {
  try {
    // Read the SQL setup file
    const sqlFilePath = path.join(process.cwd(), 'supabase_setup.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Executing SQL setup script...');
    
    // Execute the SQL statements
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
    
    // Verify the tables were created
    const { data: tables, error: listError } = await supabase
      .from('chapter_requests')
      .select('id')
      .limit(1);
      
    if (listError) {
      console.warn('Warning: Could not verify tables were created:', listError);
    } else {
      console.log('Database setup verified successfully.');
    }
    
    console.log('Supabase setup completed.');
  } catch (err) {
    console.error('Error initializing Supabase:', err);
  }
}

initializeSupabase().catch(console.error);