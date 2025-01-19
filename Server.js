const express = require('express');
const firebaseAdmin = require('firebase-admin');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

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
// Create a folder in Firestore
app.post('/api/create-folder', async (req, res) => {
    try {
      const { folderName, parentID } = req.body;
  
      // Check if folderName exists
      if (!folderName) {
        return res.status(400).json({ error: 'Folder name is required' });
      }
  
      // Create folder in Firestore
      const folderRef = await db.collection('folders').add({
        name: folderName,
        parentID: parentID || null,  // If no parent ID, set as null
        isDeleted: false,
        ownerId: req.user.uid  // Ensure you have user data to associate it with the correct user
      });
  
      res.json({ message: 'Folder created successfully', folderId: folderRef.id });
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Error creating folder' });
    }
  });
  

// File upload handling using multer
const upload = multer({ dest: 'uploads/' });  // Temporary folder to store uploaded files

// File upload route
app.post('/api/upload-file', upload.single('file'), async (req, res) => {
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(file.path));
  formData.append('key', 'public_G22nhXS4Z4biETXGSrSV42HFA3Gz');  // Replace with your actual API key

  try {
    const response = await fetch('https://upload.io/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data && data.url) {
      // Store file metadata in Firestore
      await db.collection('files').add({
        fileName: file.originalname,
        fileUrl: data.url,
        folderId: req.body.folderId || null  // Assuming folderId is passed in the request body
      });

      // Clean up the temporary file after uploading
      fs.unlinkSync(file.path);

      res.status(200).json({ message: 'File uploaded successfully!', fileUrl: data.url });
    } else {
      res.status(500).json({ error: 'Error uploading file to Upload.io' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Firestore listener to update real-time changes for files/folders (Firestore triggers)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
