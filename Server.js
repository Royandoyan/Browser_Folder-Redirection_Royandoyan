const express = require("express");
const path = require("path");
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { addDoc, collection, onSnapshot } = require("firebase/firestore");
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
const storage = getStorage(firebaseApp);

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Real-time folder and file management
app.get("/folders", async (req, res) => {
  const snapshot = await onSnapshot(collection(db, "folders"), (snapshot) => {
    const folders = snapshot.docs.map(doc => doc.data());
    res.json(folders);
  });
});

app.post("/create-folder", async (req, res) => {
  const folderName = req.body.folderName;
  if (folderName) {
    await addDoc(collection(db, "folders"), {
      name: folderName,
      createdAt: new Date()
    });
    res.send({ message: "Folder created successfully!" });
  } else {
    res.status(400).send({ error: "Folder name is required!" });
  }
});

// Server listening
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
