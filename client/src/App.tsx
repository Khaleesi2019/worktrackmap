import { Switch, Route, useLocation, Redirect } from "wouter";
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
import { Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";

// Loading component
function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isInitialized } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated and initialization is complete
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      setLocation("/auth");
    }
  }, [user, isLoading, isInitialized, setLocation]);
  
  // Show loading state while checking authentication
  if (isLoading || !isInitialized) {
    return <Loading />;
  }
  
  // If not authenticated, redirect
  if (!user) {
    return null;
  }
  
  // If authenticated, render the protected content
  return (
    <div className="flex h-screen lg:pt-0 pt-0">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden bg-background">
          {children}
        </main>
        <MobileNavbar />
      </div>
    </div>
  );
}

// Public route - will redirect to dashboard if already logged in
function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading, isInitialized } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading || !isInitialized) {
    return <Loading />;
  }
  
  // If authenticated and trying to access a public route, redirect to dashboard
  if (user) {
    return <Redirect to="/dashboard" />;
  }
  
  // If not authenticated, render the public component
  return <Component />;
}

// Root route - redirects based on auth state
function RootRedirect() {
  const { user, isLoading, isInitialized } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading || !isInitialized) {
    return <Loading />;
  }
  
  // Redirect based on auth state
  if (user) {
    return <Redirect to="/dashboard" />;
  } else {
    return <Welcome />;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <RootRedirect />}
      </Route>
      
      <Route path="/auth">
        {() => <PublicRoute component={AuthPage} />}
      </Route>
      
      <Route path="/welcome">
        {() => <PublicRoute component={Welcome} />}
      </Route>
      
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/location">
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
      
      <Route>
        {() => <NotFound />}
      </Route>
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
              <Suspense fallback={<Loading />}>
                <Toaster />
                <Router />
              </Suspense>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
