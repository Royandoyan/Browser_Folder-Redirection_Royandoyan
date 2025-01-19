const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

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

// Placeholder for file upload
app.post("/uploadFile", (req, res) => {
  const { fileName, folderID, fileData } = req.body;
  console.log("File uploaded:", { fileName, folderID, fileData });
  res.status(201).send({ message: "File uploaded successfully." });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
