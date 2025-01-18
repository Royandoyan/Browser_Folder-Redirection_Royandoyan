const express = require('express');
const multer = require('multer'); // Import multer for file uploads
const cors = require('cors');
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 3000;

// Firebase initialization
admin.initializeApp();
const db = getFirestore();

app.use(cors());
app.use(bodyParser.json());

// Set up multer for file upload handling
const storage = multer.memoryStorage(); // Use memory storage for uploading files
const upload = multer({ storage: storage });

// Upload endpoint for handling file uploads
app.post('/upload-file', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Here you would interact with Firebase or another database to save metadata
    try {
        // Example of saving metadata to Firestore (you can modify this as needed)
        await db.collection('files').add({
            filename: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
            uploadDate: new Date(),
        });

        res.status(200).json({
            message: 'File uploaded successfully',
            fileDetails: {
                filename: req.file.originalname,
                size: req.file.size,
                mimeType: req.file.mimetype,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
