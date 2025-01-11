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
    element.className = item.isDirectory ? 'folder' : 'file';

    if (item.isDirectory) {
      const folderIcon = document.createElement('span');
      folderIcon.className = 'folder-icon';
      element.appendChild(folderIcon);

      const folderName = document.createElement('span');
      folderName.textContent = item.name;
      folderName.className = 'folder';
      element.appendChild(folderName);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = `/uploads/${item.name}`;
      fileLink.target = '_blank';

      let iconPath = ''; // Path to specific icons
      if (item.name.match(/\.(jpeg|jpg|png|gif)$/i)) {
        const imgPreview = document.createElement('img');
        imgPreview.src = `/uploads/${item.name}`;
        imgPreview.alt = item.name;
        imgPreview.className = 'file-image';
        fileLink.appendChild(imgPreview);
      } else if (item.name.match(/\.(ppt|pptx)$/i)) {
        iconPath = 'icons/ppt-icon.png';
      } else if (item.name.match(/\.(doc|docx)$/i)) {
        iconPath = 'icons/word-icon.png';
      } else if (item.name.match(/\.(xls|xlsx)$/i)) {
        iconPath = 'icons/excel-icon.png';
      }

      if (iconPath) {
        const iconImg = document.createElement('img');
        iconImg.src = iconPath;
        iconImg.alt = item.name;
        iconImg.className = 'file-icon';
        element.appendChild(iconImg);
      }

      fileLink.textContent = item.name;
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
    fetchFileStructure();
  } else {
    alert('Failed to upload files');
  }
});

fetchFileStructure();
