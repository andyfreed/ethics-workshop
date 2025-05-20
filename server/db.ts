import * as schema from "@shared/schema";

// This module now only exports the schema
// All database operations are handled through Supabase
console.log("Database configured to use Supabase only");

// Export the schema for use in other modules
export { schema };

// If we're in development, log that we're using Supabase only
if (process.env.NODE_ENV === 'development') {
  console.log("Running in development mode with Supabase-only configuration");
}
