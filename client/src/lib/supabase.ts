import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Add debug logging
console.log('Supabase initialization in client:');
console.log('VITE_SUPABASE_URL:', supabaseUrl || 'not set');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'set (starts with ' + supabaseKey.substring(0, 10) + '...)' : 'not set');

// Validate the Supabase URL format - must start with https:// and have a valid domain
let isValidSupabaseUrl = false;
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    isValidSupabaseUrl = url.protocol === 'https:' && url.hostname.includes('.');
  } catch (e) {
    console.warn('Invalid Supabase URL format');
  }
}

// Log warnings if credentials are missing or invalid
if (!supabaseUrl || !isValidSupabaseUrl) {
  console.warn('Supabase URL is missing or invalid. Using local storage only.');
}

if (!supabaseKey) {
  console.warn('Supabase API key is missing. Using local storage only.');
}

// Only create the client if we have valid credentials
let supabase: SupabaseClient | null = null;
try {
  if (isValidSupabaseUrl && supabaseKey) {
    console.log('Initializing Supabase client for browser...');
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
  supabase = null;
}

export { supabase };
export default supabase;
