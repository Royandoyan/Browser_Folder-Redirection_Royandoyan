const express = require("express");
const path = require("path");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, where } = require("firebase/firestore");
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
const multer = require("multer");
const cors = require("cors");
const pathLib = require("path");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.firebasestorage.app",
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867",
  measurementId: "G-RG2M2FHGWV"
};

// Initialize Firebase
const app = express();
const port = 3000;
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Initialize Firebase Admin SDK
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(require("./path-to-service-account-file.json")),
  storageBucket: "browser-redirection.firebasestorage.app"
});

const bucket = firebaseAdmin.storage().bucket();

// Middleware
app.use(express.static(path.join(__dirname, 'templates')));
app.use(bodyParser.json());
app.use(cors());  // Enable CORS for frontend requests

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Get folders
app.get("/folders", async (req, res) => {
    const { parentId, isDeleted } = req.query;
    const snapshot = await getDocs(query(collection(db, "folders"), where("parentId", "==", parentId || null), where("isDeleted", "==", isDeleted === "true")));
    res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
});

// Create folder
app.post("/create-folder", async (req, res) => {
    const { folderName, parentId } = req.body;
    if (!folderName) return res.status(400).send({ error: "Folder name is required!" });
    await addDoc(collection(db, "folders"), { name: folderName, createdAt: new Date(), isDeleted: false, parentId: parentId || null });
    res.send({ message: "Folder created successfully!" });
});

// Mark folder as deleted
app.post("/delete-folder", async (req, res) => {
    const { folderId } = req.body;
    if (!folderId) return res.status(400).send({ error: "Folder ID is required!" });
    await updateDoc(doc(db, "folders", folderId), { isDeleted: true });
    res.send({ message: "Folder deleted successfully!" });
});

// Set up multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint to upload files to Firebase Storage
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }     

  const fileName = pathLib.basename(req.file.originalname);
  const file = bucket.file(`files/${fileName}`);

  try {
    await file.save(req.file.buffer, {
      contentType: req.file.mimetype,
      public: true, // Make the file public
    });

    const fileUrl = `https://storage.googleapis.com/${bucket.name}/files/${fileName}`;

    // Optionally store file metadata in Firestore
    await addDoc(collection(db, "files"), {
      name: fileName,
      url: fileUrl,
      createdAt: new Date(),
    });

    // Send the file URL back to the frontend
    res.json({ fileUrl });
  } catch (error) {
    res.status(500).send(`Error uploading file: ${error.message}`);
  }
});

// Start server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
