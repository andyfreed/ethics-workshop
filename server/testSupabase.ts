import { createClient } from '@supabase/supabase-js';

// Get the Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

console.log(`Testing Supabase connection to: ${supabaseUrl.substring(0, 20)}...`);

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Simple function to test the connection
async function testConnection() {
  try {
    console.log('Testing basic Supabase API...');
    
    // Get the current timestamp from Supabase (lightweight call)
    const { data, error } = await supabase.rpc('get_timestamp');
    
    // Handle any errors
    if (error) {
      console.error('Error connecting to Supabase:');
      console.error(error);
      
      // Try a simpler request - just the service health
      console.log('Trying alternative health check...');
      const { error: healthError } = await supabase.from('_health').select('*').limit(1);
      
      if (healthError) {
        console.error('Health check also failed:');
        console.error(healthError);
      } else {
        console.log('Health check succeeded, but RPC failed.');
      }
      
      // Try to ping the URL directly
      console.log('Attempting to ping Supabase URL...');
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`);
        console.log(`Ping response status: ${response.status}`);
        console.log(`Ping response headers:`, Object.fromEntries(response.headers.entries()));
      } catch (pingError) {
        console.error('Error pinging Supabase URL:');
        console.error(pingError);
      }
      
      return;
    }
    
    // Success!
    console.log('Successfully connected to Supabase!');
    console.log('Timestamp:', data);
    
    // Try to check if the tables exist
    console.log('Checking if tables exist in Supabase...');
    
    // Test for chapter_requests table
    const { data: chapterData, error: chapterError } = await supabase
      .from('chapter_requests')
      .select('count', { count: 'exact', head: true });
      
    if (chapterError) {
      console.log('chapter_requests table does not exist or is not accessible.');
      console.log(chapterError);
    } else {
      console.log('chapter_requests table exists!');
    }
    
    // Test for workshop_sessions table
    const { data: sessionData, error: sessionError } = await supabase
      .from('workshop_sessions')
      .select('count', { count: 'exact', head: true });
      
    if (sessionError) {
      console.log('workshop_sessions table does not exist or is not accessible.');
      console.log(sessionError);
    } else {
      console.log('workshop_sessions table exists!');
    }
    
    // Test for participants table
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('count', { count: 'exact', head: true });
      
    if (participantsError) {
      console.log('participants table does not exist or is not accessible.');
      console.log(participantsError);
    } else {
      console.log('participants table exists!');
    }
    
  } catch (e) {
    console.error('Unhandled exception during Supabase test:');
    console.error(e);
  }
}

// Run the test
testConnection()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed with exception:', err));