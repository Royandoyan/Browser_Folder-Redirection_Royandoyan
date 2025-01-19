const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors"); // Import CORS

const app = express();
const port = 3000;

// CORS configuration
app.use(cors({
  origin: "https://browser-folder-redirection-royandoyan.onrender.com", // Allow only your frontend domain
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

// File upload route (proxy to Upload.io API)
app.post("/uploadFile", async (req, res) => {
  try {
    // Ensure the file data and name are provided
    if (!req.body.fileData || !req.body.fileName) {
      return res.status(400).send({ error: "File data and name are required." });
    }

    // Convert the Base64 fileData back to binary
    const fileBuffer = Buffer.from(req.body.fileData, 'base64');

    // Prepare the form data
    const formData = new FormData();
    formData.append("file", fileBuffer, req.body.fileName);

    // Send the file to the Upload.io API
    axios.post('https://api.upload.io/v1/files/upload', formData, {
      headers: {
        'Authorization': 'Bearer secret_G22nhXS2vsL4g26QP2tTfqrBNn4p',
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => console.log(response.data))
      .catch(error => console.error(error));
    

    // Handle the response from Upload.io API
    if (response.data.error) {
      return res.status(500).send({ error: "File upload failed: " + response.data.error });
    }

    // File upload was successful, return the data
    res.status(201).send({
      message: "File uploaded successfully!",
      fileUrl: response.data.url, // URL of the uploaded file
      fileMetadata: response.data.metadata, // Optional: metadata of the file
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).send({ error: "File upload failed. Please try again." });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
