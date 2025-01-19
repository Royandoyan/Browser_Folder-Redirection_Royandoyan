const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors");
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // Temporary folder for file uploads

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: "https://browser-folder-redirection-royandoyan.onrender.com", // Frontend domain
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "templates"))); // Serve static files from the templates folder

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// Folder creation endpoint
app.post("/createFolder", (req, res) => {
  const { name, parentID, isDeleted } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Folder name is required." });
  }

  console.log("Folder created:", { name, parentID, isDeleted });
  res.status(201).json({ message: "Folder created successfully." });
});

// Fetching folders
app.get("/folders", (req, res) => {
  console.log("Fetching folders...");
  res.json([]); // Placeholder for actual folder data
});

app.post('/uploadFile', upload.single('file'), async (req, res) => {
  try {
    const { fileName, folderID } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Example: Generate a fake URL (update this with your actual storage solution)
    const fileUrl = `https://your-upload-bucket-url/${req.file.filename}`;

    // Add file metadata to Firestore
    const fileData = {
      name: fileName,
      folderID: folderID || "root", // Associate file with a folder
      url: fileUrl,
      uploadedAt: new Date().toISOString(),
    };

    // Assume you have Firestore configured in your server
    const db = require('./firebase-config.js'); // Your Firestore config
    const filesRef = db.collection("files");

    await filesRef.add(fileData);

    res.status(200).json({ message: "File uploaded successfully!", fileUrl });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ error: "Failed to upload file." });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
