import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
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

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    window.location.href = "/login";
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
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      
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
