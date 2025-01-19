const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
const multer = require('multer');
const { getFirestore, doc, setDoc } = require('firebase-admin/firestore');
const admin = require("firebase-admin");

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = getFirestore();

// CORS configuration
app.use(cors({
  origin: "https://browser-folder-redirection-royandoyan.onrender.com",
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "templates"))); 

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// File upload to Firestore (Base64 encoding approach)
app.post('/uploadFile', multer().single('file'), async (req, res) => {
  try {
    const { fileName, folderID } = req.body;
    const file = req.file;

    // Convert file to Base64
    const base64File = file.buffer.toString('base64');

    // Save file metadata and Base64 encoded content to Firestore
    await setDoc(doc(db, "files", crypto.randomUUID()), {
      fileName: fileName,
      fileData: base64File,  // Storing Base64 encoded file content
      folderID: folderID,
      createdAt: new Date(),
    });

    res.json({ message: "File uploaded and metadata saved to Firestore." });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
