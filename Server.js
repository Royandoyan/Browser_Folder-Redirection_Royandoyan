const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Setup storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve HTML file
app.use(express.static(path.join(__dirname, 'templates'))); // Serve static files from 'templates' folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded successfully');
});

// Create folder endpoint
app.post('/create-folder', (req, res) => {
  const folderName = req.body.folderName;
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
