import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SupabaseSetup() {
  const [sqlScript, setSqlScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);
  const { toast } = useToast();

  const fetchSqlScript = async () => {
    try {
      const response = await fetch('/supabase_setup.sql');
      if (!response.ok) {
        throw new Error('Failed to fetch SQL script');
      }
      const text = await response.text();
      setSqlScript(text);
    } catch (error) {
      console.error('Error fetching SQL script:', error);
      toast({
        title: "Error fetching SQL script",
        description: "Could not load the SQL setup script. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSyncClick = async () => {
    try {
      setIsLoading(true);
      setSyncResult(null);
      setSyncSuccess(null);
      
      const response = await apiRequest('/api/sync/supabase', {
        method: 'POST',
        body: {}
      });
      
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
                <span>Sync to: {process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 25) + '...' : 'Supabase URL not set'}</span>
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