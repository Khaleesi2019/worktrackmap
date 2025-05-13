
import React, { lazy } from 'react';
import { Route, Router as WouterRouter, Switch } from 'wouter';
import { useAuth } from './context/AuthContext';

// Lazy-loaded components
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LocationTracking = lazy(() => import('./pages/LocationTracking'));
const RemoteAssistance = lazy(() => import('./pages/RemoteAssistance'));
const RustDeskPage = lazy(() => import('./pages/RustDeskPage'));
const NotFound = lazy(() => import('./pages/not-found'));

export default function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <WouterRouter>
      <Switch>
        {/* Public routes */}
        <Route path="/auth" component={AuthPage} />
        
        {/* Protected routes */}
        {isAuthenticated ? (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/location" component={LocationTracking} />
            <Route path="/remote" component={RemoteAssistance} />
            <Route path="/rustdesk" component={RustDeskPage} />
          </>
        ) : (
          <Route path="/:rest*">
            {() => {
              window.location.href = '/auth';
              return null;
            }}
          </Route>
        )}
        
        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}
