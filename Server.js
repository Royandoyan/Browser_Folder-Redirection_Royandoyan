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
async function createFolder() {
    const name = folderName.value.trim();
    if (!name) {
      return alert('Folder name cannot be empty');
    }
  
    const userId = auth.currentUser.uid;
    const parentID = null; // You can set this dynamically if needed
  
    try {
      const response = await fetch('/createFolder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          folderName: name,
          parentID
        })
      });
  
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create folder');
      }
  
      folderName.value = '';
      loadFolders();
    } catch (error) {
      console.error('Error creating folder: ', error);
      alert('Error creating folder: ' + error.message);
    }
  }
  

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
