const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the dist/frontend directory
app.use(express.static(path.join(__dirname, 'dist/frontend/browser')));

// Handle Angular routing - return index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend/browser/index.html'));
});

app.listen(port, () => {
  console.log(`AI Digital Enrollment frontend server running on port ${port}`);
});
