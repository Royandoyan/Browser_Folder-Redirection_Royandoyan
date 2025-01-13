const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static files (uploads and templates)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
const upload = multer({ storage }).array('files');

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'templates', 'index.html')));

app.post('/upload', upload, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    broadcastUpdate();
    res.json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/create-folder', (req, res) => {
  try {
    const folderName = req.query.folderName;
    const folderPath = path.join(__dirname, 'uploads', folderName);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      broadcastUpdate();
      res.json({ message: 'Folder created successfully' });
    } else {
      res.status(400).json({ error: 'Folder already exists' });
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// New Route for Profile Deletion
app.post('/delete-profile', (req, res) => {
  try {
    const profileDataPath = path.join(__dirname, 'uploads', 'profileData.json');
    if (fs.existsSync(profileDataPath)) {
      fs.unlinkSync(profileDataPath); // Delete the profile data file
      broadcastUpdate(); // Notify all clients
      res.json({ message: 'Profile deleted successfully' });
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/files', (req, res) => {
  try {
    const uploadDir = path.join(__dirname, 'uploads');
    const getFiles = (dirPath) => {
      return fs.readdirSync(dirPath).map(file => {
        const fullPath = path.join(dirPath, file);
        const isDirectory = fs.lstatSync(fullPath).isDirectory();
        return { name: file, isDirectory };
      });
    };
    res.json(getFiles(uploadDir));
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// WebSocket Setup
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

const broadcastUpdate = () => {
  const updateMessage = JSON.stringify({ type: 'update' });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updateMessage);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('A new client connected');
  ws.on('message', (message) => {
    console.log('received: %s', message);
  });
  ws.on('close', () => {
    console.log('A client disconnected');
  });
});
