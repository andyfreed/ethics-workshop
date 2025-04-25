import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Hardcoded SQL script for setting up Supabase tables
const initialSqlScript = `-- Create chapter_requests table
CREATE TABLE IF NOT EXISTS public.chapter_requests (
  id SERIAL PRIMARY KEY,
  chapter_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_date DATE NOT NULL,
  alternate_date DATE,
  estimated_attendees INTEGER NOT NULL,
  instructor_name TEXT NOT NULL,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create workshop_sessions table
CREATE TABLE IF NOT EXISTS public.workshop_sessions (
  id SERIAL PRIMARY KEY,
  chapter_name TEXT NOT NULL,
  workshop_date DATE NOT NULL,
  instructor_name TEXT NOT NULL,
  max_attendees INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  request_id INTEGER REFERENCES public.chapter_requests(id),
  reported_to_cfp_board BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cfp_id TEXT NOT NULL,
  email TEXT NOT NULL,
  session_id INTEGER REFERENCES public.workshop_sessions(id),
  attendance_confirmed BOOLEAN NOT NULL DEFAULT true,
  reported_to_cfp_board BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- IMPORTANT: This disables Row Level Security for simplicity
-- In a production environment, you would want to configure proper RLS policies
ALTER TABLE public.chapter_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants DISABLE ROW LEVEL SECURITY;

-- Create service_role access for API operations
-- This allows the server-side API to perform operations with the service role
-- Using the SUPABASE_SERVICE_ROLE_KEY environment variable
GRANT ALL PRIVILEGES ON TABLE public.chapter_requests TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.workshop_sessions TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.participants TO service_role;

-- Enable public access for the application
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.chapter_requests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.workshop_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.participants TO anon, authenticated;

-- Grant sequence usage
GRANT USAGE, SELECT ON SEQUENCE chapter_requests_id_seq TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE workshop_sessions_id_seq TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE participants_id_seq TO anon, authenticated, service_role;

-- Set up Foreign Key Permissions
GRANT REFERENCES ON public.chapter_requests TO anon, authenticated, service_role;
GRANT REFERENCES ON public.workshop_sessions TO anon, authenticated, service_role;`;

export default function SupabaseSetup() {
  const [sqlScript, setSqlScript] = useState<string>(initialSqlScript);
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);
  const { toast } = useToast();

  const fetchSqlScript = async () => {
    // Just reset to the initial script
    setSqlScript(initialSqlScript);
    toast({
      title: "SQL script loaded",
      description: "Copy this script and run it in your Supabase SQL Editor."
    });
  };

  const handleSyncClick = async () => {
    try {
      setIsLoading(true);
      setSyncResult(null);
      setSyncSuccess(null);
      
      const response = await apiRequest('POST', '/api/sync/supabase');
      
      setSyncResult('Data successfully synced to Supabase!');
      setSyncSuccess(true);
      
      toast({
        title: "Sync successful",
        description: "Data has been synced to Supabase successfully.",
      });
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
      setSyncResult('Failed to sync data to Supabase. Please check console for details.');
      setSyncSuccess(false);
      
      toast({
        title: "Sync failed",
        description: "Could not sync data to Supabase. Please try again or check the console for more details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSqlScript();
  }, []);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Supabase Setup</h1>
      
      {syncResult && (
        <Alert className={`mb-6 ${syncSuccess ? 'bg-green-900/20 border-green-900' : 'bg-destructive/20 border-destructive'}`}>
          {syncSuccess ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-destructive" />}
          <AlertTitle>{syncSuccess ? 'Success!' : 'Error!'}</AlertTitle>
          <AlertDescription>
            {syncResult}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>SQL Setup Script</CardTitle>
              <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-900">Step 1</Badge>
            </div>
            <CardDescription>
              Run this SQL script in your Supabase SQL Editor to create the necessary tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sqlScript}
              onChange={(e) => setSqlScript(e.target.value)}
              className="font-mono text-sm h-[400px] bg-black/30"
              placeholder="Loading SQL script..."
            />
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button variant="outline" onClick={fetchSqlScript}>
              Reload Script
            </Button>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(sqlScript);
                toast({
                  title: "Copied!",
                  description: "SQL script copied to clipboard",
                });
              }}
            >
              Copy to Clipboard
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Sync Data to Supabase</CardTitle>
              <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-900">Step 2</Badge>
            </div>
            <CardDescription>
              After creating tables in Supabase, sync your local data to Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-4">
              <div className="bg-black/30 rounded-md p-4 text-sm">
                <p className="mb-2"><strong>Prerequisites:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Create tables in Supabase using the SQL script</li>
                  <li>Set the following environment variables:
                    <ul className="list-disc pl-5 mt-1">
                      <li>SUPABASE_URL - Your Supabase project URL</li>
                      <li>SUPABASE_SERVICE_ROLE_KEY - Service role key for admin operations</li>
                      <li>SUPABASE_ANON_KEY - Anon key for client operations</li>
                    </ul>
                  </li>
                  <li>The service role key (preferred) has more permissions than the anon key</li>
                </ul>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <Database className="h-5 w-5" />
                <span>Sync to: Supabase database</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button 
              onClick={handleSyncClick} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Syncing..." : "Sync Data to Supabase"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}