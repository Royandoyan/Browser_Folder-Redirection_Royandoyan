const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure();
  }
};

let currentFolder = '';

async function fetchFileStructure() {
  const response = await fetch(`/files?folder=${currentFolder}`);
  const data = await response.json();

  const container = document.getElementById('file-structure');
  container.innerHTML = '';

  data.forEach(item => {
    const element = document.createElement('div');
    element.className = item.isDirectory ? 'folder' : 'file';

    if (item.isDirectory) {
      const folderIcon = document.createElement('img');
      folderIcon.src = 'folder.png';
      folderIcon.alt = 'Folder';
      folderIcon.addEventListener('dblclick', () => {
        currentFolder = `${currentFolder}/${item.name}`;
        document.getElementById('currentFolder').value = currentFolder;
        fetchFileStructure();
      });
      element.appendChild(folderIcon);
    } else {
      const fileLink = document.createElement('a');
      fileLink.href = `/uploads/${currentFolder}/${item.name}`;
      fileLink.target = '_blank';
      const fileIcon = document.createElement('img');
      fileIcon.src = 'file.png';
      fileIcon.alt = item.name;
      fileLink.appendChild(fileIcon);
      element.appendChild(fileLink);
    }

    const itemName = document.createElement('span');
    itemName.textContent = item.name;
    element.appendChild(itemName);
    container.appendChild(element);
  });
}

document.getElementById('create-folder-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const folderName = document.getElementById('folderName').value;
  const response = await fetch(`/create-folder?folderName=${currentFolder}/${folderName}`, { method: 'POST' });
  if (response.ok) {
    fetchFileStructure();
  }
});

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('fileInput');
  const formData = new FormData();

  formData.append('folder', currentFolder);
  Array.from(fileInput.files).forEach(file => formData.append('files', file));

  const response = await fetch('/upload', { method: 'POST', body: formData });
  if (response.ok) {
    fetchFileStructure();
  }
});

fetchFileStructure();
