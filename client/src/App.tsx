import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/useAuth";
import { Suspense, Component, ReactNode } from 'react';

import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import CourseDescription from "@/pages/CourseDescription";
import ChapterRequestForm from "@/pages/ChapterRequestForm";
import ParticipantSignIn from "@/pages/ParticipantSignIn";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";
import SupabaseSetup from "@/components/SupabaseSetup";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Custom error boundary component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2 className="text-lg font-bold">Something went wrong:</h2>
          <pre className="mt-2 p-2 bg-gray-800 rounded text-sm">
            {this.state.error?.message || "Unknown error"}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/course-description" component={CourseDescription} />
          <Route path="/chapter-request" component={ChapterRequestForm} />
          <Route path="/participant-signin" component={ParticipantSignIn} />
          <Route path="/supabase-setup" component={SupabaseSetup} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/:tab" component={AdminDashboard} />
          <Route path="/admin/supabase-setup" component={SupabaseSetup} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Toaster />
          </ErrorBoundary>
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
