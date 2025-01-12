// Establish WebSocket connection for real-time updates
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

// WebSocket message handler for real-time updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure(); // Refresh the file structure on update
  } else if (message.error) {
    alert(message.error); // Show error if there's one
  } else if (message.success) {
    alert(message.success); // Show success message
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

// Handle profile update
const profileForm = document.getElementById('profile-update-form');
profileForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const profile = {
    name: document.getElementById('profile-name').value,
    age: document.getElementById('profile-age').value,
    address: document.getElementById('profile-address').value,
    gender: document.getElementById('profile-gender').value
  };
  
  const userId = "user123"; // Example user ID. Replace with actual logic
  
  ws.send(JSON.stringify({
    type: 'updateProfile',
    userId,
    profile
  }));
});

// Toggle between login and signup forms
document.getElementById('signup-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-form').style.display = 'none';  // Hide login form
  document.getElementById('signup-form').style.display = 'block'; // Show signup form
});

document.getElementById('login-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-form').style.display = 'none';  // Hide signup form
  document.getElementById('login-form').style.display = 'block';  // Show login form
});

// Handle login form submission (example)
document.getElementById('login')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  console.log(`Logging in with: ${email}, ${password}`);
  alert('Login form submitted!'); // Simulate login submission
});

// Handle signup form submission (example)
document.getElementById('signup')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const name = document.getElementById('name').value;
  const age = document.getElementById('age').value;
  const address = document.getElementById('address').value;
  const gender = document.getElementById('gender').value;
  console.log(`Signing up with: ${email}, ${password}, ${name}, ${age}, ${address}, ${gender}`);
  alert('Signup form submitted!'); // Simulate signup submission
});

// Fetch file structure on page load
fetchFileStructure();
