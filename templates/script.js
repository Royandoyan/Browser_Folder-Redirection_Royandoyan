/* Establish WebSocket connection for real-time updates
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure();
  }
};

// Fetch and display file/folder structure
async function fetchFileStructure() {
  const response = await fetch('/files');
  const data = await response.json();

  const container = document.getElementById('file-structure');
  container.innerHTML = ''; 

  data.forEach(item => {
    const element = document.createElement('div');
    element.className = item.isDirectory ? 'folder' : 'file';

    if (item.isDirectory) {
      const folderIcon = document.createElement('span');
      folderIcon.className = 'folder-icon';
      element.appendChild(folderIcon);

      const folderName = document.createElement('span');
      folderName.textContent = item.name;
      element.appendChild(folderName);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = `/uploads/${item.name}`;
      fileLink.target = '_blank';

      let mediaPreview = null;

      // Preview images
      if (item.name.match(/\.(jpeg|jpg|png|gif)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = `/uploads/${item.name}`;
        mediaPreview.alt = item.name;
        mediaPreview.className = 'file-image';
      } 
      // Preview videos
      else if (item.name.match(/\.(mp4|webm|ogg)$/i)) {
        mediaPreview = document.createElement('video');
        mediaPreview.src = `/uploads/${item.name}`;
        mediaPreview.controls = true; // Add playback controls
        mediaPreview.className = 'file-video';
      }
      // Assign icons for other files
      else if (item.name.match(/\.(ppt|pptx)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = 'ppt.png'; // Relative to templates folder
        mediaPreview.alt = 'PowerPoint File';
        mediaPreview.className = 'file-icon';
      } else if (item.name.match(/\.(doc|docx)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = 'doc.png'; // Relative to templates folder
        mediaPreview.alt = 'Word File';
        mediaPreview.className = 'file-icon';
      } else if (item.name.match(/\.(xls|xlsx)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = 'xls.png'; // Relative to templates folder
        mediaPreview.alt = 'Excel File';
        mediaPreview.className = 'file-icon';
      }

      if (mediaPreview) {
        element.appendChild(mediaPreview);
      }

      const fileName = document.createElement('span');
      fileName.textContent = item.name;
      fileLink.appendChild(fileName);
      element.appendChild(fileLink);
    }
    container.appendChild(element);
  });
}

// Handle folder creation
document.getElementById('create-folder-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const folderName = document.getElementById('folderName').value;
  const response = await fetch(`/create-folder?folderName=${folderName}`, { method: 'POST' });
  if (response.ok) {
    alert('Folder created successfully');
    fetchFileStructure();
  } else {
    alert('Failed to create folder');
  }
});

// Handle file upload
document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('fileInput');
  const formData = new FormData();

  Array.from(fileInput.files).forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch('/upload', { method: 'POST', body: formData });
  if (response.ok) {
    alert('Files uploaded successfully');
    fetchFileStructure(); // Refresh the structure to include uploaded files
  } else {
    alert('Failed to upload files');
  }
});

// Fetch file structure on page load
fetchFileStructure();
*/









const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => console.log("WebSocket connected");

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  handleUpdate(update);
};

// Create a folder
async function createFolder() {
  const folderName = document.getElementById("folderNameInput").value;

  if (!folderName) {
    alert("Enter a folder name");
    return;
  }

  try {
    const response = await fetch("/create-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderName }),
    });

    const data = await response.json();
    console.log("Folder created:", data);
  } catch (error) {
    console.error("Error creating folder:", error);
  }
}

// Upload a file
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Select a file to upload");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/upload", { method: "POST", body: formData });
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

// Handle real-time updates
function handleUpdate(update) {
  const updatesDiv = document.getElementById("realTimeUpdates");
  updatesDiv.innerText = JSON.stringify(update, null, 2);
}
