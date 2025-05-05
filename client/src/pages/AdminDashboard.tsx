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
  const { isAuthenticated, user, login } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/:tab?");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sessions");
  const [loginOpen, setLoginOpen] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof loginSchema>) => {
      // First do the login request
      const response = await apiRequest("POST", "/api/login", credentials);
      // Then immediately verify the login by getting the user info
      await apiRequest("GET", "/api/user", null);
      return response;
    },
    onSuccess: () => {
      login();
      setLoginOpen(false);
      toast({
        title: "Logged in",
        description: "You have been successfully logged in.",
      });
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
      setActiveTab(params.tab);
    }
  }, [params]);

  // Effect to check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      setLoginOpen(true);
    }
  }, [isAuthenticated]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLocation(`/admin/${value}`);
  };

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  // Redirect to home if not admin
  if (isAuthenticated && user && !user.isAdmin) {
    setLocation("/");
    return null;
  }

  return (
    <>
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
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
