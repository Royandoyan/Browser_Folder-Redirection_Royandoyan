// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const upload = require('upload.io');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Setup multer for file handling
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage: storage });

// Upload.io API key (from Upload.io)
const uploadIoClient = upload({
    publicKey: 'public_G22nhXS4Z4biETXGSrSV42HFA3Gz',  // Your API key
    secretKey: 'secret_G22nhXS6Gy49Y8tkxtbt7wtwEGi2', // Your secret key
});

// File upload API (client-side Firebase SDK will handle Firestore)
app.post('/upload-file', uploadMiddleware.single('file'), async (req, res) => {
    const { folderId, userId } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Upload to Upload.io
        const uploadResponse = await uploadIoClient.upload(file.buffer, {
            filename: file.originalname,
            tags: ['user_file', userId],
        });

        // Here, we just return the file URL, the client-side Firebase SDK will handle saving it to Firestore.
        res.status(200).json({
            message: 'File uploaded successfully',
            fileURL: uploadResponse.url
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload file', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
