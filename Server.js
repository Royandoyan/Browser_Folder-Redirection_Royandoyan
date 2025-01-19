const express = require('express');
const firebaseAdmin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com"
});

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (your frontend)
app.use(express.static(path.join(__dirname, 'templates')));

// Middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample API route (you can add more as needed)
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the File Manager API!' });
});

// Firebase Firestore API for managing folders and files
const db = firebaseAdmin.firestore();

// Create a folder in Firestore
app.post('/api/create-folder', async (req, res) => {
  try {
    const { folderName, parentID } = req.body;
    const folderRef = await db.collection('folders').add({
      name: folderName,
      parentID: parentID || null,
      isDeleted: false
    });
    res.json({ message: 'Folder created successfully', folderId: folderRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error creating folder' });
  }
});

// Delete a folder (soft delete)
app.post('/api/delete-folder', async (req, res) => {
  try {
    const { folderId } = req.body;
    await db.collection('folders').doc(folderId).update({ isDeleted: true });
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting folder' });
  }
});

// Get all folders that are not deleted
app.get('/api/get-folders', async (req, res) => {
  try {
    const snapshot = await db.collection('folders')
      .where('isDeleted', '==', false)
      .get();

    let folders = [];
    snapshot.forEach(doc => {
      folders.push({ id: doc.id, ...doc.data() });
    });

    res.json({ folders });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folders' });
  }
});

// Firestore listener to update real-time changes for files/folders (Firestore triggers)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
