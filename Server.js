const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Log __dirname for debugging
console.log("__dirname:", __dirname);

// Setup storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use an absolute path for the uploads folder, making sure it's relative to __dirname
    const uploadDir = path.join(__dirname, 'uploads');
    // Ensure the directory exists or create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/templates/index.html'));
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.send('File uploaded successfully');
});

// Create folder endpoint
app.post('/create-folder', (req, res) => {
  const folderName = req.query.folderName;
  const folderPath = path.join(__dirname, 'uploads', folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    res.send('Folder created');
  } else {
    res.send('Folder already exists');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
