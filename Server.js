const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://browser-redirection.firebaseio.com"
});

const app = express();
const db = admin.firestore();

app.use(bodyParser.json());

// Serve static files from the templates folder
app.use(express.static('templates'));

// Endpoint to create a new folder
app.post('/createFolder', async (req, res) => {
    try {
      const { userId, folderName, parentID } = req.body;
  
      if (!folderName || !userId) {
        return res.status(400).json({ error: "Folder name and user ID are required" });
      }
  
      const newFolderRef = db.collection('folders').doc();
      await newFolderRef.set({
        userId: userId,
        folderName: folderName,
        parentID: parentID || null,
        isDeleted: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  
      res.status(201).json({ message: "Folder created successfully", folderId: newFolderRef.id });
    } catch (error) {
      console.error('Error creating folder: ', error);
      res.status(500).json({ error: "Internal server error", details: error.message });
    }
  });
  
  

// Endpoint to delete a folder
app.post('/deleteFolder', async (req, res) => {
  try {
    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({ error: "Folder ID is required" });
    }

    const folderRef = db.collection('folders').doc(folderId);
    await folderRef.update({ isDeleted: true });

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error('Error deleting folder: ', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
