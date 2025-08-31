import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, LoginForm } from './components';
import { useAuth } from './hooks/useAuth';
import {
  AlertManagement,
  EventManagement,
  Teams,
  RulesEngine,
} from './screens';

function App() {
  // Skip authentication for demo deployment
  const isDemoMode =
    process.env.NODE_ENV === 'production' ||
    window.location.hostname !== 'localhost';
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication (only in local dev)
  if (!isDemoMode && isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#ffffff',
        }}
      >
        🚨 Loading R-Ops...
      </div>
    );
  }

  // Show login form only in local development when not authenticated
  if (!isDemoMode && !isAuthenticated) {
    return <LoginForm />;
  }

  // Show main app (always for demo mode, or when authenticated in dev)
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Default route redirects to alerts */}
        <Route index element={<Navigate to="/alerts" replace />} />

        {/* Main application routes */}
        <Route path="alerts" element={<AlertManagement />} />
        <Route path="events" element={<EventManagement />} />
        <Route path="teams" element={<Teams />} />
        <Route path="rules" element={<RulesEngine />} />

        {/* Catch all route - redirect to alerts */}
        <Route path="*" element={<Navigate to="/alerts" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
