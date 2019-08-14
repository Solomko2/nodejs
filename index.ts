/**
 * Primary file for the API
 */

// Dependencies
import { server } from './server';
// import { workers } from './workers';

// Declare the app
const app = {} as any;

// Init function
app.init = () => {
  // Start the server
  server.init();

  // Start the workers
  // workers.init();

};

// Execute
app.init();

// Export the app
export { app }

