const express = require('express');
const multer = require('multer');
const path = require('path');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase, ref, set } = require('firebase-admin/database');
const { getAuth } = require('firebase-admin/auth');
const cors = require('cors');

// Initialize express and set up Firebase Admin SDK
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files (index.html, etc.)

// Firebase Admin SDK initialization
initializeApp({
  credential: require('./firebase-credentials.json'), // Download this from Firebase Console
  databaseURL: 'https://<your-project-id>.firebaseio.com' // Your Firebase Database URL
});

const db = getDatabase();
const auth = getAuth();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes

// Route to handle user signup
app.post('/signup', async (req, res) => {
  const { email, password, name, age, address, course } = req.body;
  
  try {
    const userRecord = await auth.createUser({
      email,
      password
    });

    // Store profile info in Firebase Realtime Database
    await set(ref(db, 'users/' + userRecord.uid), {
      name,
      age,
      address,
      course
    });

    res.status(201).json({ message: 'User signed up successfully', userId: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to handle user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await auth.getUserByEmail(email);

    // Check if password matches (Firebase doesn't provide password verification directly)
    // Use Firebase Authentication API to verify password in the client side instead.

    res.status(200).json({ message: 'User logged in successfully', userId: userRecord.uid });
  } catch (error) {
    res.status(400).json({ error: 'Login failed: ' + error.message });
  }
});

// Route for file upload
app.post('/upload', upload.array('files'), (req, res) => {
  console.log('Files uploaded:', req.files);
  res.status(200).json({ message: 'Files uploaded successfully' });
});

// Route to handle folder creation (for file management)
app.post('/create-folder', (req, res) => {
  const { folderName } = req.query;

  // You can use this to create a folder structure on the server or Firebase
  console.log(`Creating folder: ${folderName}`);
  
  res.status(200).json({ message: 'Folder created successfully' });
});

// Route for getting file structure
app.get('/files', (req, res) => {
  // Logic to fetch file/folder structure from server or Firebase
  const files = [
    { name: 'file1.txt', isDirectory: false },
    { name: 'folder1', isDirectory: true }
  ];
  res.json(files);
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
