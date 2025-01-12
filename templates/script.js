// Establish WebSocket connection for real-time updates
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

// WebSocket message handler for real-time updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure(); // Refresh the file structure on update
  }
};

// Fetch and display file/folder structure
async function fetchFileStructure() {
  const response = await fetch('/files');
  const data = await response.json();

  const container = document.getElementById('file-structure');
  container.innerHTML = ''; // Clear the existing content

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
      // Assign icons for other file types
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
document.getElementById('create-folder-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const folderName = document.getElementById('folderName').value;
  const response = await fetch(`/create-folder?folderName=${folderName}`, { method: 'POST' });
  if (response.ok) {
    alert('Folder created successfully');
    fetchFileStructure(); // Refresh the structure to include the new folder
  } else {
    alert('Failed to create folder');
  }
});

// Handle file upload
document.getElementById('signup')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Collect form data
  const formData = new FormData(document.getElementById('signup'));

  // Send registration data to the backend
  const response = await fetch('/register', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    alert('Registration successful! Redirecting to login...');
    document.getElementById('signup-form').style.display = 'none'; // Hide signup form
    document.getElementById('login-form').style.display = 'block'; // Show login form
  } else {
    alert('Registration failed. Please try again.');
  }
});

// Handle navigation between login and signup
document.getElementById('signup-link')?.addEventListener('click', () => {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('login-link')?.addEventListener('click', () => {
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
});

// Handle user profile update (assuming WebSocket integration)
const profileForm = document.getElementById('profile-update-form');
profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const profile = {
    name: document.getElementById('profile-name').value,
    age: document.getElementById('profile-age').value,
    address: document.getElementById('profile-address').value,
    gender: document.getElementById('profile-gender').value
  };
  const userId = "user123"; // Get the actual user ID from session or localStorage
  ws.send(JSON.stringify({
    type: 'updateProfile',
    userId,
    profile
  }));
});

// Handle profile deletion
document.getElementById('delete-profile')?.addEventListener('click', async () => {
  const userId = "user123"; // Get the actual user ID from session or localStorage
  alert('Profile deleted');
  // Optionally, send request to backend to delete profile from database
  // For now, it's just a frontend mock action.
  fetchFileStructure(); // Refresh file structure or other necessary UI updates
});

// Fetch file structure on page load
fetchFileStructure();
