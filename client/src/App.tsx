import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";

import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import CourseDescription from "@/pages/CourseDescription";
import ChapterRequestForm from "@/pages/ChapterRequestForm";
import ParticipantSignIn from "@/pages/ParticipantSignIn";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import SupabaseSetup from "@/components/SupabaseSetup";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/course-description" component={CourseDescription} />
        <Route path="/chapter-request" component={ChapterRequestForm} />
        <Route path="/participant-signin" component={ParticipantSignIn} />
        <Route path="/supabase-setup" component={SupabaseSetup} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/workshop-sessions" component={AdminDashboard} />
        <Route path="/admin/chapter-requests" component={AdminDashboard} />
        <Route path="/admin/participant-data" component={AdminDashboard} />
        <Route path="/admin/supabase-setup" component={SupabaseSetup} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
