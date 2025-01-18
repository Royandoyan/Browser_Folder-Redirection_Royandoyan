const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "browser-redirection",
    "private_key_id": "your_private_key_id",
    "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk@browser-redirection.iam.gserviceaccount.com",
    "client_id": "client_id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "YOUR_X509_CERT_URL"
  }),
  databaseURL: "https://browser-redirection-default-rtdb.firebaseio.com"
});

// Create an Express application
const app = express();

// Use bodyParser to parse incoming request bodies
app.use(bodyParser.json());

// Define routes
app.get('/', (req, res) => {
  res.send('Hello, Firebase!');
});

// Endpoint to store file metadata in Firestore
app.post('/uploadFile', async (req, res) => {
  const fileMetadata = req.body; // Expecting file metadata to be sent in the request body
  
  try {
    // Add file metadata to Firestore
    const docRef = await admin.firestore().collection('files').add(fileMetadata);
    res.status(200).send({ message: 'File metadata uploaded successfully', fileId: docRef.id });
  } catch (error) {
    res.status(500).send({ message: 'Error uploading file metadata', error: error.message });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
