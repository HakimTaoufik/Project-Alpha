// app.js

const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');
const pdf = require('html-pdf');
const fs = require('fs');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'YOUR_DATABASE_URL',
  storageBucket: 'YOUR_STORAGE_BUCKET',
});

const app = express();
const port = process.env.PORT || 3000;

// Use body-parser middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up Firestore
const db = admin.firestore();

// Set up a basic route to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle form submissions
app.post('/submit', (req, res) => {
  const userData = req.body.userData;

  // Store user data in Firestore
  const docRef = db.collection('user_data').add({
    data: userData,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Generate PDF from template
  const templatePath = __dirname + '/template.html';
  const outputPath = __dirname + `/pdfs/${docRef.id}.pdf`; // Use the Firestore document ID as the PDF filename

  const htmlContent = fs.readFileSync(templatePath, 'utf8');
  const compiledHtml = htmlContent.replace('{{ userData }}', userData);
  console.log(userData);
  pdf.create(compiledHtml).toFile(outputPath, (err, _) => {
    if (err) {
      console.error('Error generating PDF:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('Data submitted successfully!');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
