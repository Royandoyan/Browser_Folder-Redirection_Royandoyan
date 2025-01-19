const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors"); // Import CORS
const multer = require('multer');
const { initializeApp } = require("firebase-admin");
const { getFirestore, doc, setDoc } = require("firebase-admin/firestore");
const crypto = require("crypto");

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
  databaseURL: 'https://your-project-id.firebaseio.com'
});

const db = getFirestore();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000; // Ensure the port matches the Render environment

// CORS configuration
app.use(cors({
  origin: "https://browser-folder-redirection-royandoyan.onrender.com", // Frontend deployed domain
  methods: ["GET", "POST"],
  credentials: true,
}));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "templates"))); // Serve static files from the templates folder

// Multer configuration for handling file uploads
const upload = multer({ dest: 'uploads/' });  // Temporary file storage location

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// File upload route
app.post('/uploadFile', upload.single('file'), async (req, res) => {
  try {
    // Ensure the file is present
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { fileName, folderID } = req.body;

    console.log('Received file:', req.file);
    console.log('File Name:', fileName);
    console.log('Folder ID:', folderID);

    // Here you should upload the file to Firebase Storage or a third-party service.
    // For now, we'll just simulate it by returning a static URL.
    const fileUrl = `https://your-storage-bucket-url/${req.file.filename}`;

    // Save the file metadata to Firestore
    await setDoc(doc(db, "files", crypto.randomUUID()), {
      fileName: fileName,
      fileUrl: fileUrl,
      folderID: folderID,
      createdAt: new Date(),
    });

    // Return file URL
    res.json({ fileUrl });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
