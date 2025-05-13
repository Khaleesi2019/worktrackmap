import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import Welcome from "@/pages/Welcome";
import AuthPage from "@/pages/AuthPage";
import LocationTracking from "@/pages/LocationTracking";
import Attendance from "@/pages/Attendance";
import TeamChat from "@/pages/TeamChat";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

// Context Providers
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Layout
import Sidebar from "@/components/layout/Sidebar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import Header from "@/components/layout/Header";
import { useEffect } from "react";

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);
  
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>;
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex h-screen lg:pt-0 pt-0">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden bg-surface-light dark:bg-surface-dark">
          {children}
        </main>
        <MobileNavbar />
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/location-tracking">
        {() => (
          <ProtectedRoute>
            <LocationTracking />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/attendance">
        {() => (
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/chat">
        {() => (
          <ProtectedRoute>
            <TeamChat />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/reports">
        {() => (
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/settings">
        {() => (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
