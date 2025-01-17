// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIKjugxiJh9Bd0B32SEd4t9FImRQ9SVK8",
  authDomain: "browser-redirection.firebaseapp.com",
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com",
  projectId: "browser-redirection",
  storageBucket: "browser-redirection.firebasestorage.app",
  messagingSenderId: "119718481062",
  appId: "1:119718481062:web:3f57b707f3438fc309f867",
  measurementId: "G-RG2M2FHGWV"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Create Folder
async function createFolder() {
  const folderName = document.getElementById("folderName").value;
  if (!folderName) return alert("Please enter a folder name!");

  const folderRef = db.collection("folders").doc();
  await folderRef.set({
    name: folderName,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  document.getElementById("folderName").value = "";
  alert("Folder created successfully!");
  loadFolders();
}

// Load Folders
async function loadFolders() {
  const folderList = document.getElementById("folderList");
  folderList.innerHTML = "";

  const snapshot = await db.collection("folders").get();
  snapshot.forEach(doc => {
    const folder = doc.data();
    const li = document.createElement("li");
    li.textContent = folder.name;
    folderList.appendChild(li);
  });
}

// Upload Files
async function uploadFiles() {
  const files = document.getElementById("fileInput").files;
  if (files.length === 0) return alert("Please select files to upload!");

  const folderName = prompt("Enter the folder name to upload files:");
  const folderRef = db.collection("folders").where("name", "==", folderName);

  const folderSnapshot = await folderRef.get();
  if (folderSnapshot.empty) return alert("Folder not found!");

  const folderDoc = folderSnapshot.docs[0];
  const folderId = folderDoc.id;

  for (let file of files) {
    const fileRef = storage.ref(`files/${folderId}/${file.name}`);
    await fileRef.put(file);

    const fileUrl = await fileRef.getDownloadURL();
    await db.collection("files").add({
      folderId: folderId,
      name: file.name,
      url: fileUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  alert("Files uploaded successfully!");
  loadFiles();
}

// Load Files
async function loadFiles() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  const snapshot = await db.collection("files").get();
  snapshot.forEach(doc => {
    const file = doc.data();
    const li = document.createElement("li");
    li.textContent = `${file.name} - ${file.url}`;
    fileList.appendChild(li);
  });
}

// Initial Load
loadFolders();
loadFiles();
