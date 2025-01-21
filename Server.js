const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const port = 3000;

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDv6QALxp7OqwTaS6shB4SZ1n2fmSwvM1E",
    authDomain: "filehaven-aae7f.firebaseapp.com",
    projectId: "filehaven-aae7f",
    storageBucket: "filehaven-aae7f.firebasestorage.app",
    messagingSenderId: "651173413232",
    appId: "1:651173413232:web:4d5478f6bb5fa8427ecfb5",
    measurementId: "G-S2KQMF1SLK"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

cloudinary.config({
    cloud_name: 'dimiumaxg',
    api_key: '236537376185178',
    api_secret: 'xGb6dQRMzV0MJOFfJBqHjbJ5Wd4',
});

// Enable CORS for all origins
app.use(cors());

// Multer Configuration for File Handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint for File Upload
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;
        const userId = req.body.user_id;
        const parentId = req.body.parent_id;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Extract the file extension
        const fileExtension = file.originalname.split('.').pop();
        const publicId = `${uuidv4()}.${fileExtension}`;

        // Upload file to Cloudinary directly from the buffer
        cloudinary.uploader.upload_stream(
            { resource_type: 'auto', public_id: publicId },
            async (error, result) => {
                if (error) {
                    console.error('Cloudinary error:', error);
                    return res.status(500).json({ message: 'Error uploading to Cloudinary.' });
                }

                // Store metadata in Firestore
                const metadata = {
                    name: file.originalname,
                    public_id: result.public_id,
                    url: result.secure_url,
                    parent_id: parentId === "0" ? null : parentId,
                    user_id: userId,
                    uploaded_at: new Date(),
                };

                try {
                    const filesRef = collection(db, 'files');
                    await addDoc(filesRef, metadata);
                    res.status(200).json({
                        message: 'File uploaded and metadata stored.',
                        fileUrl: result.secure_url,
                    });
                } catch (dbError) {
                    console.error('Firestore error:', dbError);
                    res.status(500).json({ message: 'Error saving metadata to Firestore.' });
                }
            }
        ).end(file.buffer); // Pass the file buffer to the uploader
    } catch (error) {
        console.error('Error during upload:', error); // Log the error
        res.status(500).json({ message: 'Error during upload.', error: error.message }); // Send JSON error
    }
});


// Add route to serve the index.html when navigating to the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/templates/index.html'); // Ensure correct path to the index.html
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
