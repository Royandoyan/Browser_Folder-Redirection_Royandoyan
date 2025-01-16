/*const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.jsson());

// Serve static files (uploads and templates)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Correctly serve uploads
app.use(express.static(path.join(__dirname, 'templates')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage }).array('files');

// Route to serve index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Route for file upload
app.post('/upload', upload, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded');
  }
  broadcastUpdate();
  res.send('Files uploaded successfully');
});

// Route to create folder
app.post('/create-folder', (req, res) => {
  const folderName = req.query.folderName;
  const folderPath = path.join(__dirname, 'uploads', folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    broadcastUpdate();
    res.send('Folder created successfully');
  } else {
    res.send('Folder already exists');
  }
});

// Route to fetch file structure
app.get('/files', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');

  const getFiles = (dirPath) => {
    return fs.readdirSync(dirPath).map(file => {
      const fullPath = path.join(dirPath, file);
      const isDirectory = fs.lstatSync(fullPath).isDirectory();
      return {
        name: file,
        isDirectory
      };
    });
  };

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  res.json(getFiles(uploadDir));
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket Setup
const wss = new WebSocket.Server({ server });
const broadcastUpdate = () => {
  const updateMessage = JSON.stringify({ type: 'update' });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updateMessage);
    }
  });
};
*/
const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const admin = require("firebase-admin");
const WebSocket = require("ws");

// Firebase Admin SDK setup
const serviceAccount = require("./path/to/firebase-service-account.json"); // Update with your Firebase service account JSON path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-database-url.firebaseio.com", // Replace with your Firebase Realtime Database URL
  storageBucket: "your-firebase-storage-bucket", // Replace with your Firebase Storage bucket name
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, "templates")));
app.use(express.json());

// WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  console.log("WebSocket connection established");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    console.log("Received:", data);

    // Broadcast to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// Create folder
app.post("/create-folder", async (req, res) => {
  const { folderName, parentID = null } = req.body;

  if (!folderName) {
    return res.status(400).send("Folder name is required");
  }

  try {
    const folderRef = db.collection("folders").doc();
    await folderRef.set({
      id: folderRef.id,
      name: folderName,
      parentID,
      isDeleted: false,
    });

    res.status(200).send({ message: "Folder created", folder: folderRef.id });
    broadcastUpdate({ type: "create-folder", folder: { id: folderRef.id, name: folderName, parentID } });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Upload file
app.post("/upload", upload.single("file"), async (req, res) => {
  const { folderID } = req.body;

  if (!req.file || !folderID) {
    return res.status(400).send("File and folderID are required");
  }

  try {
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      metadata: { contentType: req.file.mimetype },
    });

    blobStream.on("error", (err) => res.status(500).send(err.message));
    blobStream.on("finish", async () => {
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      await db.collection("files").add({
        name: req.file.originalname,
        folderID,
        url: fileUrl,
        isDeleted: false,
      });

      res.status(200).send("File uploaded successfully");
      broadcastUpdate({ type: "upload-file", file: { name: req.file.originalname, folderID, url: fileUrl } });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Helper function to broadcast updates
function broadcastUpdate(update) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(update));
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
