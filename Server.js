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

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware
app.use(express.static(path.join(__dirname, 'templates')));
app.use(bodyParser.json());

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

// Start server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
