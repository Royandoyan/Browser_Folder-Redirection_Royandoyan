const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure();
  }
};

// Fetching and displaying file/folder structure
async function fetchFileStructure() {
  const response = await fetch('/files');
  const data = await response.json();

  const container = document.getElementById('file-structure');
  container.innerHTML = ''; 

  data.forEach(item => {
    const element = document.createElement('div');
    if (item.isDirectory) {
      const folderIcon = document.createElement('span');
      folderIcon.className = 'folder-icon';
      element.appendChild(folderIcon);

      const folderName = document.createElement('span');
      folderName.textContent = item.name;
      folderName.className = 'folder';
      element.appendChild(folderName);
    } else {
      const fileName = document.createElement('span');
      fileName.textContent = item.name;
      fileName.className = 'file';

      if (item.name.match(/\.(jpeg|jpg|gif|png)$/i)) {
        const imgPreview = document.createElement('img');
        imgPreview.src = `/uploads/${item.name}`;
        element.appendChild(imgPreview);
      } else {
        const fileIcon = document.createElement('img');
        fileIcon.src = getFileIcon(item.name);
        fileIcon.className = 'file-icon';
        element.appendChild(fileIcon);
      }

      const fileType = document.createElement('span');
      fileType.textContent = getFileExtension(item.name);
      fileType.className = 'file-type';
      element.appendChild(fileType);

      element.appendChild(fileName);
    }
    container.appendChild(element);
  });
}

function getFileIcon(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf': return 'icons/pdf-icon.png';
    case 'doc':
    case 'docx': return 'icons/word-icon.png';
    case 'ppt':
    case 'pptx': return 'icons/ppt-icon.png';
    case 'xls':
    case 'xlsx': return 'icons/excel-icon.png';
    case 'zip': return 'icons/zip-icon.png';
    case 'mp4':
    case 'mkv':
    case 'mov': return 'icons/video-icon.png';
    default: return 'icons/file-icon.png';
  }
}

function getFileExtension(fileName) {
  return fileName.split('.').pop().toUpperCase();
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
    fetchFileStructure();
  } else {
    alert('Failed to upload files');
  }
});

fetchFileStructure(); 
