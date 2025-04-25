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

-- Enable Row Level Security
ALTER TABLE public.chapter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" 
  ON public.chapter_requests 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" 
  ON public.workshop_sessions 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" 
  ON public.participants 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Enable anon access for read operations
CREATE POLICY "Enable read access for anonymous users" 
  ON public.chapter_requests 
  FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Enable read access for anonymous users" 
  ON public.workshop_sessions 
  FOR SELECT 
  TO anon 
  USING (true);`;

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
                  <li>Ensure your SUPABASE_URL and SUPABASE_ANON_KEY environment variables are set</li>
                  <li>You must be logged in as an admin to use this function</li>
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