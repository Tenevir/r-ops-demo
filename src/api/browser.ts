import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup the service worker with all handlers
export const worker = setupWorker(...handlers);

// Start the worker in development and production mode (for demo app)
export const startMockApi = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'production'
  ) {
    await worker.start({
      onUnhandledRequest: 'warn',
    });
    console.log('🔧 Mock API started with MSW');
  }
};
