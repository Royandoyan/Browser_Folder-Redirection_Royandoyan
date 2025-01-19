const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors"); // Import CORS
const { getFirestore, doc, setDoc } = require("firebase/firestore");
const crypto = require("crypto");

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

// Function to upload file to a third-party service
async function uploadFileToService(fileData, fileName) {
  try {
    const formData = new FormData();
    formData.append("file", fileData, fileName); // Append the file to the FormData object

    const response = await axios.post("https://api.upload.io/v1/files/Upload", formData, {
      headers: {
        ...formData.getHeaders(),
        "Authorization": `secret_G22nhXS2vsL4g26QP2tTfqrBNn4p`, // Replace with your actual API key
      },
    });

    // Assuming the response contains a URL of the uploaded file
    const fileUrl = response.data.fileUrl; // Modify according to the actual response structure
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

// Handle file upload and metadata storage
app.post('/uploadFile', async (req, res) => {
  const { fileData, fileName, folderID } = req.body;

  try {
    // Upload the file to the third-party service
    const fileUrl = await uploadFileToService(fileData, fileName);

    // Initialize Firestore
    const db = getFirestore(); // Make sure Firebase is initialized in your app

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
