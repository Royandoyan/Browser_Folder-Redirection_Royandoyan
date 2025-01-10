const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'templates')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage }).array('files');  // For multiple files

// Route to serve index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

// Route for file upload
app.post('/upload', upload, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded');
  }
  broadcastUpdate();
  res.send('Files uploaded successfully');
});

// Route to create folder
app.post('/create-folder', (req, res) => {
  const folderName = req.query.folderName;
  const folderPath = path.join(__dirname, 'uploads', folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    broadcastUpdate();
    res.send('Folder created successfully');
  } else {
    res.send('Folder already exists');
  }
});

// Route to fetch file structure
app.get('/files', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');

  const getFiles = (dirPath) => {
    return fs.readdirSync(dirPath).map(file => {
      const fullPath = path.join(dirPath, file);
      const isDirectory = fs.lstatSync(fullPath).isDirectory();
      return {
        name: file,
        path: fullPath,
        isDirectory
      };
    });
  };

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  res.json(getFiles(uploadDir));
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// WebSocket Setup
const wss = new WebSocket.Server({ server });
const broadcastUpdate = () => {
  const updateMessage = JSON.stringify({ type: 'update' });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updateMessage);
    }
  });
};
