const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors"); // Import CORS

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000; // Ensure the port matches the Render environment

// CORS configuration
app.use(cors({
  origin: "https://browser-folder-redirection-royandoyan.onrender.com", // Frontend deployed domain
  methods: ["GET", "POST"],
  credentials: true,
}));

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "templates"))); // Serve static files from the templates folder

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// Placeholder for folder creation
app.post("/createFolder", (req, res) => {
  const { name, parentID, isDeleted } = req.body;
  console.log("Folder created:", { name, parentID, isDeleted });
  res.status(201).send({ message: "Folder created successfully." });
});

// Placeholder for fetching folders
app.get("/folders", (req, res) => {
  console.log("Fetching folders...");
  res.send([]);
});

app.post('/uploadFile', async (req, res) => {
  const fileData = req.body.fileData;
  const fileName = req.body.fileName;
  const folderID = req.body.folderID;

  try {
    // Assuming you're saving files using a service like Upload.io
    const fileUrl = await uploadFileToService(fileData, fileName);  // Placeholder function

    // Save file metadata to Firestore
    await setDoc(doc(db, "files", crypto.randomUUID()), {
      fileName: fileName,
      fileUrl: fileUrl,
      folderID: folderID,
      createdAt: new Date(),
    });

    res.json({ fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
