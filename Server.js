const express = require("express");
const path = require("path");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, where } = require("firebase/firestore");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

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
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(express.static(path.join(__dirname, 'templates'))); // Serve static files from 'templates' folder
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html')); // Correct path to index.html
});

// Real-time folder management
app.get("/folders", async (req, res) => {
  const snapshot = await getDocs(query(collection(db, "folders"), where("parentId", "==", null), where("isDeleted", "==", false)));
  const folders = snapshot.docs.map(doc => doc.data());
  res.json(folders);
});

// Folder creation
app.post("/create-folder", async (req, res) => {
  const folderName = req.body.folderName;
  const parentId = req.body.parentId || null;
  if (folderName) {
    await addDoc(collection(db, "folders"), {
      name: folderName,
      createdAt: new Date(),
      isDeleted: false,
      parentId: parentId
    });
    res.send({ message: "Folder created successfully!" });
  } else {
    res.status(400).send({ error: "Folder name is required!" });
  }
});

// Mark folder as deleted
app.post("/delete-folder", async (req, res) => {
  const folderId = req.body.folderId;
  if (folderId) {
    const folderRef = doc(db, "folders", folderId);
    await updateDoc(folderRef, { isDeleted: true });
    res.send({ message: "Folder deleted successfully!" });
  } else {
    res.status(400).send({ error: "Folder ID is required!" });
  }
});

// Server listening
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
