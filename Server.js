// Importing necessary modules
const express = require('express');
const firebaseAdmin = require('firebase-admin');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');  // To serve static files

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: 'https://browser-redirection.firebaseio.com',
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'templates' folder (for index.html, CSS, JS)
app.use(express.static(path.join(__dirname, 'templates')));

// Firestore reference
const db = firebaseAdmin.firestore();

// Route to get folders (Home or Deleted)
app.get('/folders', async (req, res) => {
  const { isDeleted = false, parentID = null } = req.query;

  try {
    const folderSnapshot = await db
      .collection('folders')
      .where('isDeleted', '==', isDeleted)
      .where('parentID', '==', parentID)
      .get();

    const folders = folderSnapshot.docs.map(doc => doc.data());
    res.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).send('Error fetching folders');
  }
});

// Route to create a folder
app.post('/create-folder', async (req, res) => {
  const { folderName, parentID, userId } = req.body;

  try {
    const folderRef = db.collection('folders').doc();
    await folderRef.set({
      folderName,
      parentID,
      isDeleted: false,
      userId,
    });

    res.status(201).send('Folder created');
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).send('Error creating folder');
  }
});

// Route to upload a file to bytescale.com
app.post('/upload', async (req, res) => {
  try {
    const fileUrl = req.body.fileUrl; // Assume fileUrl is received from client (the link to the file in bytescale.com)

    if (!fileUrl) {
      return res.status(400).send('No file URL provided');
    }

    // Optionally, save the file metadata to Firestore
    await db.collection('files').add({
      fileUrl,
      fileMetadata: {
        name: req.body.fileName,
        size: req.body.fileSize,
        type: req.body.fileType,
      },
      userId: req.body.userId, // Store the user ID for access control
    });

    res.status(200).json({ message: 'File uploaded successfully', fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

// Route for root URL to serve the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
