// Import required modules
const express = require('express');
const path = require('path');
const firebaseAdmin = require('firebase-admin');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();  // For environment variables, e.g., Firebase Admin SDK and API keys

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require('./firebase-service-account.json')),
  databaseURL: 'https://browser-redirection.firebaseio.com',
});

// Initialize Express
const app = express();
const port = process.env.PORT || 3000;

// Serve static files (e.g., index.html, styles.css, etc.)
app.use(express.static(path.join(__dirname, 'templates')));

// Firebase Firestore
const db = firebaseAdmin.firestore();

// Middleware to parse JSON and form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer for handling file uploads (local or external storage)
const storage = multer.memoryStorage();  // Store files in memory
const upload = multer({ storage: storage });

// Upload.io API key (or configure another service)
const uploadApiKey = "public_G22nhXS4Z4biETXGSrSV42HFA3Gz";

// POST route for file upload to Upload.io or bytescale.com
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    // Prepare file for Upload.io (or another file upload service)
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    formData.append('apiKey', uploadApiKey);

    // Send file to Upload.io (or another service)
    const response = await axios.post('https://upload.upload.io', formData, {
      headers: formData.getHeaders(),
    });

    const fileUrl = response.data.url;  // The URL of the uploaded file

    // Save file metadata to Firestore
    const fileRef = db.collection('files').doc();
    await fileRef.set({
      fileName: req.file.originalname,
      fileURL: fileUrl,
      parentID: req.body.parentID,  // Folder ID for where the file should be placed
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    // Respond with success
    res.status(200).send({ fileURL: fileUrl, message: 'File uploaded and metadata saved' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

// Firebase Realtime Database: Add a folder (Firestore)
app.post('/create-folder', async (req, res) => {
  const { folderName, parentID } = req.body;

  try {
    const folderRef = db.collection('folders').doc();
    await folderRef.set({
      name: folderName,
      parentID: parentID || null,
      isDeleted: false,
    });

    res.status(200).send('Folder created');
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).send('Error creating folder');
  }
});

// Firebase Realtime Database: Delete folder
app.post('/delete-folder', async (req, res) => {
  const { folderID } = req.body;

  try {
    const folderRef = db.collection('folders').doc(folderID);
    await folderRef.update({
      isDeleted: true,
    });

    res.status(200).send('Folder deleted');
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).send('Error deleting folder');
  }
});

// Serve frontend HTML (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
