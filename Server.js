const express = require('express');
const path = require('path');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.firebasestorage.app",
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867",
  measurementId: "G-RG2M2FHGWV"
};

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: firebaseConfig.databaseURL
});

// Middleware to enable CORS and serve static files
app.use(cors());
app.use(express.static(path.join(__dirname, 'templates')));

// Serve the HTML, CSS, and JS files from the 'templates' folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Firebase authentication middleware for protected routes
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token) {
    firebaseAdmin.auth().verifyIdToken(token)
      .then(decodedToken => {
        req.user = decodedToken;
        next();
      })
      .catch(err => {
        res.status(401).send('Unauthorized');
      });
  } else {
    res.status(401).send('Unauthorized');
  }
};

// Example of a protected route
app.get('/user', authenticate, (req, res) => {
  res.send({ user: req.user });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
