const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');
const fetch = require('node-fetch'); // For interacting with Upload.io API
const path = require('path');

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com"
});

const db = firebaseAdmin.firestore();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up multer for file upload handling
const upload = multer({ dest: 'uploads/' });

// Serve the web app (static files) from the 'templates' directory
app.use(express.static('templates'));

// Serve the index.html file when accessing the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// API endpoint to create folders
app.post('/api/create-folder', async (req, res) => {
  const { folderName, parentID } = req.body;

  try {
    const folderRef = await db.collection('folders').add({
      name: folderName,
      isDeleted: false,
      parentID: parentID || null,
    });
    res.status(200).json({ folderID: folderRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to upload files
app.post('/api/upload-file', upload.single('file'), async (req, res) => {
  const file = req.file;
  const folderID = req.body.folderID; // Folder ID where the file will be uploaded

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    // Upload the file to Upload.io
    const uploadResponse = await fetch('https://api.upload.io/upload', {
      method: 'POST',
      body: new FormData().append('file', file.buffer),
      headers: {
        'Authorization': 'Bearer public_G22nhXS4Z4biETXGSrSV42HFA3Gz',
      },
    });

    const uploadedFile = await uploadResponse.json();

    // Save the file metadata in Firestore
    const fileMetadata = {
      name: file.originalname,
      fileURL: uploadedFile.url,
      folderID: folderID || null,
    };

    await db.collection('files').add(fileMetadata);

    // Send response with file details
    res.status(200).json({ message: 'File uploaded successfully!', file: uploadedFile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to delete files from Firestore
app.delete('/api/delete-file/:fileID', async (req, res) => {
  const fileID = req.params.fileID;

  try {
    const fileRef = db.collection('files').doc(fileID);
    await fileRef.delete();
    res.status(200).json({ message: 'File deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
