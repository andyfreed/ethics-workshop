import { useState, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import AdminWorkshopSessions from "./AdminWorkshopSessions";
import AdminChapterRequests from "./AdminChapterRequests";
import AdminParticipantData from "./AdminParticipantData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminDashboard() {
  const { isAuthenticated, user, isLoading, login, setDirectAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/:tab?");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sessions");
  const [dialogOpen, setDialogOpen] = useState(true);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Update dialogOpen based on authentication status
  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      setDialogOpen(false);
    } else if (!isAuthenticated) {
      setDialogOpen(true);
    }
  }, [isAuthenticated, user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof loginSchema>) => {
      console.log('Attempting login with credentials:', { username: credentials.username });
      // First do the login request
      const response = await apiRequest("POST", "/api/login", credentials);
      console.log('Login response:', response);
      
      // If username is 'admin', directly set authentication with admin privileges
      if (credentials.username.toLowerCase() === 'admin') {
        // Create a user object with admin privileges
        const adminUser = {
          id: 1,
          username: 'admin',
          isAdmin: true,
          is_admin: true
        };
        
        // Directly set the authentication state
        setDirectAuth(true, adminUser);
      }
      
      // Make sure there's a delay before checking auth status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Then verify the login
      const userStatus = await apiRequest("GET", "/api/user", null);
      console.log('User status after login:', userStatus);
      
      return response;
    },
    onSuccess: (data) => {
      console.log('Login mutation succeeded:', data);
      login();
      toast({
        title: "Logged in",
        description: "You have been successfully logged in.",
      });
      // Close the dialog on successful login
      setDialogOpen(false);
      // Fetch data for all admin components after login
      queryClient.invalidateQueries({ queryKey: ["/api/workshop-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chapter-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/participants"] });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Effect to set the active tab based on the URL
  useEffect(() => {
    if (params?.tab) {
      const tab = params.tab;
      if (tab === "workshop-sessions") {
        setActiveTab("sessions");
      } else if (tab === "chapter-requests") {
        setActiveTab("chapter-requests");
      } else if (tab === "participant-data") {
        setActiveTab("participants");
      } else {
        setActiveTab(tab);
      }
    } else {
      setActiveTab("sessions");
    }
  }, [params]);

  useEffect(() => {
    if (isAuthenticated && user && !user.isAdmin) {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "sessions") {
      setLocation(`/admin/workshop-sessions`);
    } else if (value === "chapter-requests") {
      setLocation(`/admin/chapter-requests`);
    } else if (value === "participants") {
      setLocation(`/admin/participant-data`);
    } else {
      setLocation(`/admin/${value}`);
    }
  };

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  // Add debugging for auth state changes
  useEffect(() => {
    console.log('Auth state in AdminDashboard:', { 
      isAuthenticated, 
      user: user || null, 
      isAdmin: user?.isAdmin || user?.is_admin, 
      dialogOpen
    });
  }, [isAuthenticated, user, dialogOpen]);

  if (isLoading) {
    return (
      <Card className="min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Checking authentication status...</p>
        </div>
      </Card>
    );
  }

  if (isAuthenticated && user && !user.isAdmin) {
    return null;
  }

  return (
    <>
      <Dialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Please login with your admin credentials to access the dashboard.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={loginMutation.isPending}
                  className="w-full bg-primary-500 hover:bg-primary-600"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Card>
        <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-primary-500 to-primary-600">
          <h1 className="text-xl leading-6 font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-white opacity-90">Manage workshop sessions and participant data</p>
        </div>
        {isAuthenticated && user?.isAdmin && (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="border-b px-4">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="sessions" 
                  className="py-4 px-1 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300"
                >
                  Workshop Sessions
                </TabsTrigger>
                <TabsTrigger 
                  value="chapter-requests" 
                  className="ml-8 py-4 px-1 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300"
                >
                  Chapter Requests
                </TabsTrigger>
                <TabsTrigger 
                  value="participants" 
                  className="ml-8 py-4 px-1 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:border-gray-300"
                >
                  Participant Data
                </TabsTrigger>
              </TabsList>
            </div>
            <CardContent className="p-4">
              <TabsContent value="sessions" className="mt-0 p-0">
                <AdminWorkshopSessions />
              </TabsContent>
              <TabsContent value="chapter-requests" className="mt-0 p-0">
                <AdminChapterRequests />
              </TabsContent>
              <TabsContent value="participants" className="mt-0 p-0">
                <AdminParticipantData />
              </TabsContent>
            </CardContent>
          </Tabs>
        )}
      </Card>
    </>
  );
}
