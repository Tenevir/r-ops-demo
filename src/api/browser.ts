import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup the service worker with all handlers
export const worker = setupWorker(...handlers);

// Start the worker only in local development (MSW doesn't work reliably on hosted platforms)
export const startMockApi = async () => {
  if (
    process.env.NODE_ENV === 'development' &&
    window.location.hostname === 'localhost'
  ) {
    await worker.start({
      onUnhandledRequest: 'warn',
    });
    console.log('🔧 Mock API started with MSW');
  }
};
