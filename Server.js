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
    // Use absolute path to avoid issues with __dirname
    const uploadDir = path.resolve(__dirname, 'uploads');  // Resolve the path properly
    console.log("Upload directory: ", uploadDir);

    // Check if directory exists, if not create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
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
  const indexPath = path.resolve(__dirname, 'templates', 'index.html');  // Resolve absolute path for index.html
  console.log("Serving index file from:", indexPath);
  res.sendFile(indexPath);
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  console.log("File uploaded:", req.file);
  res.send('File uploaded successfully');
});

// Create folder endpoint
app.post('/create-folder', (req, res) => {
  const folderName = req.query.folderName;
  const folderPath = path.resolve(__dirname, 'uploads', folderName);  // Resolve absolute path for folder creation
  console.log("Folder path:", folderPath);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    res.send('Folder created');
  } else {
    res.send('Folder already exists');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
