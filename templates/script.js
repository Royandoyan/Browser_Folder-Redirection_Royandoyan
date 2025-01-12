// Establish WebSocket connection for real-time updates
const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`);

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    fetchFileStructure(); // Refresh the file structure on update
  } else if (message.error) {
    alert(message.error);
  } else if (message.success) {
    alert(message.success);
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
      if (item.name.match(/\.(jpeg|jpg|png|gif)$/i)) {
        mediaPreview = document.createElement('img');
        mediaPreview.src = `/uploads/${item.name}`;
        mediaPreview.alt = item.name;
        mediaPreview.className = 'file-image';
      } else if (item.name.match(/\.(mp4|webm|ogg)$/i)) {
        mediaPreview = document.createElement('video');
        mediaPreview.src = `/uploads/${item.name}`;
        mediaPreview.controls = true;
        mediaPreview.className = 'file-video';
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
    fetchFileStructure();
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
  
  const userId = "user123"; // Example user ID, replace with actual logic
  
  ws.send(JSON.stringify({
    type: 'updateProfile',
    userId,
    profile
  }));
});

// Toggle between login and signup forms
document.getElementById('signup-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('login-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
});

// Handle login form submission
document.getElementById('login')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Simulate login process, replace with actual login logic
  if (email === "user@example.com" && password === "password123") {
    alert('Login successful!');
    
    // Show the file manager and profile forms after successful login
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('file-manager').style.display = 'block';
    document.getElementById('profile-form').style.display = 'block';

    // Optionally, fetch the user's profile details from the server
    // Example:
    // const profile = await fetchProfile(email);
    // populateProfileForm(profile);
  } else {
    alert('Invalid login credentials.');
  }
});

// Handle signup form submission
document.getElementById('signup')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const name = document.getElementById('name').value;
  const age = document.getElementById('age').value;
  const address = document.getElementById('address').value;
  const gender = document.getElementById('gender').value;
  
  // Simulate signup process, replace with actual signup logic
  alert('Sign Up Successful!');

  // Hide the signup form and show the login form after successful signup
  document.getElementById('signup-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';

  // Optionally, you can populate the login form with the user's signup details
  // document.getElementById('login-email').value = email;
  // document.getElementById('login-password').value = password;
});

// Fetch file structure on page load
fetchFileStructure();
