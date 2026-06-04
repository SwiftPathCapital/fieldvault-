// Add this to server/index.js for production (Railway serves React from Express)
// After all routes, add:

/*
const path = require('path');

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
*/

// Root package.json build script for Railway:
// "build": "cd client && npm install && npm run build"
// "start": "cd server && npm install && node index.js"
