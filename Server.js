// Import necessary libraries
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

// Set up Express app
const app = express();
app.use(cors());
app.use(express.json());

// Set up file upload using multer
const upload = multer({ dest: 'uploads/' });  // You can configure this as needed

// Firebase Auth Middleware (to check if the user is authenticated)
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization;
  
  if (!idToken) {
    return res.status(403).send('Unauthorized');
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).send('Unauthorized');
  }
};

// Route to upload files
app.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    // Upload to external service (Upload.io or others)
    const file = req.file; // file uploaded via multer
    const fileURL = "https://path-to-uploaded-file.com";  // You'd call the Upload.io API to get this URL
    
    // Store metadata in Firestore
    const fileRef = await db.collection('files').add({
      fileName: file.originalname,
      fileURL: fileURL,
      userID: req.user.uid,
      timestamp: new Date(),
      isDeleted: false
    });

    res.status(200).send({ message: "File uploaded successfully", fileID: fileRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});

// Create folder route
app.post('/createFolder', authenticate, async (req, res) => {
  try {
    const { folderName, parentID } = req.body;

    const folderRef = await db.collection('folders').add({
      name: folderName,
      parentID: parentID || null,
      userID: req.user.uid,
      isDeleted: false,
      timestamp: new Date()
    });

    res.status(200).send({ message: "Folder created successfully", folderID: folderRef.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating folder');
  }
});

// Route to delete a file or folder (soft delete)
app.delete('/deleteItem', authenticate, async (req, res) => {
  try {
    const { itemID, isFolder } = req.body;
    const itemRef = db.collection(isFolder ? 'folders' : 'files').doc(itemID);
    await itemRef.update({ isDeleted: true });

    res.status(200).send({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting item');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
