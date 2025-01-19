const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
const firebaseConfig = require('./firebaseConfig'); // Your Firebase config
const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
admin.initializeApp(firebaseConfig);
const db = admin.firestore();

// Serve static files from the 'templates' folder
app.use(express.static(path.join(__dirname, 'templates')));

// Enable JSON parsing for POST requests
app.use(express.json());

// Serve the main file manager page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Endpoint for getting folders from Firestore
app.get('/getFolders', async (req, res) => {
  try {
    const foldersSnapshot = await db.collection('folders')
      .where('parentID', '==', null)
      .where('isDeleted', '==', false)
      .get();
    
    const folders = [];
    foldersSnapshot.forEach(doc => {
      folders.push({ id: doc.id, ...doc.data() });
    });

    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching folders' });
  }
});

// Endpoint for getting deleted folders
app.get('/getDeletedFolders', async (req, res) => {
  try {
    const deletedFoldersSnapshot = await db.collection('folders')
      .where('isDeleted', '==', true)
      .get();
    
    const deletedFolders = [];
    deletedFoldersSnapshot.forEach(doc => {
      deletedFolders.push({ id: doc.id, ...doc.data() });
    });

    res.json(deletedFolders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching deleted folders' });
  }
});

// Endpoint for creating a folder
app.post('/createFolder', async (req, res) => {
  try {
    const { name, parentID } = req.body;
    const newFolder = await db.collection('folders').add({
      name,
      parentID: parentID || null,
      isDeleted: false,
    });

    res.json({ id: newFolder.id });
  } catch (error) {
    res.status(500).json({ error: 'Error creating folder' });
  }
});

// Endpoint for deleting a folder (soft delete)
app.post('/deleteFolder', async (req, res) => {
  try {
    const { folderID } = req.body;
    await db.collection('folders').doc(folderID).update({ isDeleted: true });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting folder' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
