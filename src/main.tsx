import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './theme/ThemeProvider.tsx';
import { AuthProvider } from './hooks/useAuth';
import { AlertProvider } from './hooks/useAlerts';
import { EventProvider } from './hooks/useEvents';
import { startMockApi } from './api';
import { webSocketService } from './services';

// Initialize mock API and WebSocket before rendering the app
Promise.all([
  startMockApi(),
  webSocketService.connect()
]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AlertProvider>
            <EventProvider>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </EventProvider>
          </AlertProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
});
