import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components';
import {
  AlertManagement,
  EventManagement,
  Teams,
  RulesEngine,
} from './screens';

function App() {
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
