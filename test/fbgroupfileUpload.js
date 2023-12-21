const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image');

const accessToken = 'EABImtNdQ8q4BO6gk9dzRpGX1nkGIAkn3Qno8THFsbn6v9MFE3731b0FcaqwXaH38Ysj305xqqG2VkPTbvjLykp9AxQkZAmha2ZB2OKS6YrouldqkRuc325NO4YE3rCCBIF80SCV9GyQZCccnZBMSw7J6aSQZBUAHxGr1iB2XbYj2iBH3cPNopIt84FDNb6YGvmxUdJQ8NUi0r3nn2Hn7zWzg2n8ySmFS7OjK829eC78zRciXhdV0i7XnogDoZB9r7ZBiQZDZD';
const groupId = '356736066769871'; // Replace with your Facebook Group ID

app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error uploading file' });
      }

      const mediaData = req.file ? req.file.buffer : null;

      // Create a form data object
      const formData = new FormData();
      formData.append('access_token', accessToken);
      formData.append('message', 'This is a post with binary media data');

      if (mediaData) {
        formData.append('source', mediaData, { filename: 'image.jpg', contentType: 'image/jpeg' });
      }

      // Make a POST request to the Facebook Graph API
      const response = await axios.post(`https://graph.facebook.com/v13.0/${groupId}/photos`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      // Log the response from Facebook
      console.log(response.data);

      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
