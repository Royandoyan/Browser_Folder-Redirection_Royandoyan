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

app.post("/uploadFile", async (req, res) => {
  try {
    // Validate file data and name
    if (!req.body.fileData || !req.body.fileName) {
      return res.status(400).send({ error: "File data and name are required." });
    }

    console.log("File Data:", req.body.fileData);
    console.log("File Name:", req.body.fileName);

    const fileBuffer = Buffer.from(req.body.fileData, 'base64');
    console.log("Buffer Size:", fileBuffer.length);

    const formData = new FormData();
    formData.append("file", fileBuffer, req.body.fileName);

    const response = await axios.post('https://api.upload.io/v1/files/upload', formData, {
      headers: {
        'Authorization': 'Bearer secret_G22nhXS2vsL4g26QP2tTfqrBNn4p', // Update with your token
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("Upload.io Response:", response.data);

    res.status(201).send({
      message: "File uploaded successfully!",
      fileUrl: response.data.url,
      fileMetadata: response.data.metadata,
    });

  } catch (error) {
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Status code:", error.response.status);
      return res.status(error.response.status).send({ error: error.response.data.message || "File upload failed." });
    } else if (error.request) {
      console.error("No response received:", error.request);
      return res.status(500).send({ error: "No response from the file upload server." });
    } else {
      console.error("Error message:", error.message);
      return res.status(500).send({ error: "File upload failed. Please try again." });
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
