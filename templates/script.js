// Establish WebSocket connection for real-time updates
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
  if (response.ok) {
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
          mediaPreview.controls = true;
          mediaPreview.className = 'file-video';
        }
        // Default icon for other file types
        else {
          mediaPreview = document.createElement('div');
          mediaPreview.className = 'file-icon';
        }

        fileLink.appendChild(mediaPreview);
        const fileName = document.createElement('span');
        fileName.textContent = item.name;
        element.appendChild(fileLink);
        element.appendChild(fileName);
      }

      container.appendChild(element);
    });
  }
}

fetchFileStructure();

// Handle create folder form submission
const folderForm = document.getElementById('create-folder-form');
folderForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const folderName = document.getElementById('folderName').value;
  if (folderName) {
    await fetch(`/create-folder?folderName=${folderName}`, { method: 'POST' });
    fetchFileStructure();
  }
});

// Handle file upload form submission
const uploadForm = document.getElementById('upload-form');
uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(uploadForm);
  await fetch('/upload', { method: 'POST', body: formData });
  fetchFileStructure();
});
