const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const port = 3000;

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
    // Ensure the file is provided
    if (!req.body.fileData || !req.body.fileName) {
      return res.status(400).send({ error: "File data and name are required." });
    }

    // Prepare the form data
    const formData = new FormData();
    formData.append("file", Buffer.from(req.body.fileData, "base64"), req.body.fileName);

    // Send the file to Upload.io API
    const response = await axios.post("https://api.upload.io/v1/files/upload", formData, {
      headers: {
        ...formData.getHeaders(),
        "Authorization": "Bearer public_G22nhXS4Z4biETXGSrSV42HFA3Gz", // API key
      },
    });

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
