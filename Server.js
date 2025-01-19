const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const firebaseConfig = require('./firebaseConfig.json');  // Store your Firebase credentials in this file securely

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com"  // Use your actual database URL
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware to serve static files (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'templates')));
app.use(express.json()); // To parse JSON payloads

// Middleware to verify Firebase ID token (authentication check)
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Get token from Authorization header
  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).send('Unauthorized');
  }
};

// API route to fetch folders from Firestore (only folders with parentID=null and isDeleted=false)
app.get('/api/folders', async (req, res) => {
  const db = admin.firestore();
  try {
    const foldersRef = db.collection('folders');
    const snapshot = await foldersRef.where('parentID', '==', null).where('isDeleted', '==', false).get();
    if (snapshot.empty) {
      res.status(404).send('No folders found');
      return;
    }

    const folders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(folders);
  } catch (error) {
    console.error("Error getting folders: ", error);
    res.status(500).send('Internal server error');
  }
});

// API route to fetch subfolders based on parent ID (only folders with isDeleted=false)
app.get('/api/folders/:parentID', async (req, res) => {
  const parentID = req.params.parentID;
  const db = admin.firestore();
  try {
    const foldersRef = db.collection('folders');
    const snapshot = await foldersRef.where('parentID', '==', parentID).where('isDeleted', '==', false).get();
    if (snapshot.empty) {
      res.status(404).send('No subfolders found');
      return;
    }

    const folders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(folders);
  } catch (error) {
    console.error("Error getting subfolders: ", error);
    res.status(500).send('Internal server error');
  }
});

// API route to create a folder (with data validation)
app.post('/api/folder', verifyToken, async (req, res) => {
  const { name, parentID, isDeleted = false } = req.body;  // Default isDeleted to false
  if (!name || typeof name !== 'string') {
    return res.status(400).send('Invalid folder name');
  }

  const db = admin.firestore();
  try {
    const newFolderRef = await db.collection('folders').add({
      name,
      parentID: parentID || null, // Handle missing parentID (default to null)
      isDeleted
    });
    res.status(201).json({ id: newFolderRef.id });
  } catch (error) {
    console.error("Error creating folder: ", error);
    res.status(500).send('Internal server error');
  }
});

// Serve the main HTML file for the web app
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
