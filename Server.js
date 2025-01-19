const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const cors = require("cors"); // Import CORS

const app = express();
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

app.post("/uploadFile", async (req, res) => {
  try {
    // Validate file data and name
    if (!req.body.fileData || !req.body.fileName) {
      return res.status(400).send({ error: "File data and name are required." });
    }

    // Log file data and name for debugging
    console.log("File Data:", req.body.fileData);
    console.log("File Name:", req.body.fileName);

    // Convert the Base64 fileData back to binary
    const fileBuffer = Buffer.from(req.body.fileData, 'base64');

    // Log buffer size for validation
    console.log("Buffer Size:", fileBuffer.length);

    // Optional: Check file size limit (adjust 5MB as needed)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return res.status(400).send({ error: "File size exceeds the 5MB limit." });
    }

    // Prepare the form data
    const formData = new FormData();
    formData.append("file", fileBuffer, req.body.fileName);

    // Send the file to the Upload.io API
    const response = await axios.post('https://api.upload.io/v1/files/upload', formData, {
      headers: {
        'Authorization': 'Bearer secret_G22nhXS2vsL4g26QP2tTfqrBNn4p', // Use your actual API key here
        'Content-Type': 'multipart/form-data',
      },
    });

    // Log response for debugging
    console.log("Upload.io Response:", response.data);

    // If the file upload is successful, return the file URL and metadata
    res.status(201).send({
      message: "File uploaded successfully!",
      fileUrl: response.data.url, // URL of the uploaded file
      fileMetadata: response.data.metadata, // Optional: metadata of the file
    });

  } catch (error) {
    // Detailed error handling
    if (error.response) {
      // The request was made, and the server responded with a status code
      console.error("Error response:", error.response.data);
      console.error("Status code:", error.response.status);
      return res.status(error.response.status).send({ error: error.response.data.message || "File upload failed." });
    } else if (error.request) {
      // The request was made, but no response was received
      console.error("No response received:", error.request);
      return res.status(500).send({ error: "No response from the file upload server." });
    } else {
      // Something else went wrong
      console.error("Error message:", error.message);
      return res.status(500).send({ error: "File upload failed. Please try again." });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
