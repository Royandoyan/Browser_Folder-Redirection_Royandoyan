// script.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

let user;

onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
        user = currentUser;
        document.getElementById("fileManager").style.display = "block";
        document.getElementById("authContainer").style.display = "none";
        loadFolders();
    } else {
        document.getElementById("fileManager").style.display = "none";
        document.getElementById("authContainer").style.display = "block";
    }
});

document.getElementById("signinBtn").addEventListener("click", async () => {
    const email = document.getElementById("signinEmail").value;
    const password = document.getElementById("signinPassword").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error signing in: ", error.message);
    }
});

document.getElementById("signupBtn").addEventListener("click", async () => {
    const fullName = document.getElementById("fullName").value;
    const age = document.getElementById("age").value;
    const address = document.getElementById("address").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Error signing up: ", error.message);
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
});

document.getElementById("createFolderBtn").addEventListener("click", async () => {
    const folderName = document.getElementById("folderName").value;

    if (!folderName) return;

    try {
        const newFolder = {
            name: folderName,
            isDeleted: false,
            parentID: null,
        };

        const docRef = await addDoc(collection(db, "folders"), newFolder);
        console.log("Folder created: ", docRef.id);
        loadFolders();
    } catch (error) {
        console.error("Error creating folder: ", error);
    }
});

async function loadFolders() {
    const q = query(collection(db, "folders"), where("isDeleted", "==", false), where("parentID", "==", null));
    const querySnapshot = await getDocs(q);

    const folderList = document.getElementById("folderList");
    folderList.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const folder = doc.data();
        const folderDiv = document.createElement("div");
        folderDiv.classList.add("folder");
        folderDiv.innerText = folder.name;
        folderDiv.addEventListener("click", () => openFolder(doc.id));
        folderList.appendChild(folderDiv);
    });
}

async function openFolder(folderID) {
    const q = query(collection(db, "folders"), where("parentID", "==", folderID));
    const querySnapshot = await getDocs(q);

    const folderPath = document.getElementById("folderPath");
    folderPath.innerText = `Folder Path: ${folderID}`;

    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "";

    querySnapshot.forEach((doc) => {
        const folder = doc.data();
        const folderDiv = document.createElement("div");
        folderDiv.classList.add("folder");
        folderDiv.innerText = folder.name;
        folderList.appendChild(folderDiv);
    });
}

document.getElementById("uploadFileBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) return;

    const uploadResponse = await fetch("https://api.upload.io/upload", {
        method: "POST",
        body: new FormData().append("file", file),
        headers: {
            "Authorization": "Bearer public_G22nhXS4Z4biETXGSrSV42HFA3Gz",
        },
    });

    const uploadedFile = await uploadResponse.json();
    const fileMetadata = {
        name: file.name,
        fileURL: uploadedFile.url,
        folderID: "someFolderID",  // specify the folder ID
    };

    try {
        await addDoc(collection(db, "files"), fileMetadata);
        document.getElementById("uploadStatus").innerText = "File uploaded successfully!";
    } catch (error) {
        console.error("Error uploading file: ", error);
    }
});
