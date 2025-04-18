// Start script for the API server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting RSS API server...');

const apiServer = spawn('node', [path.join(__dirname, 'index.js')], { 
  stdio: 'inherit',
  shell: true
});

apiServer.on('error', (error) => {
  console.error(`Failed to start API server: ${error.message}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down API server...');
  apiServer.kill();
  process.exit();
}); 