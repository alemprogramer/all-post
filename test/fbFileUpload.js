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

const accessToken = 'EABImtNdQ8q4BO2rsC6ykIjZAgJ6jkXuNKZCukYCMjXwk2vJUZCbsJrD1WZBb8iLmfzWZA9hNneKKZBMOHy2EHZCcwt53J5oXMKlE6PxMWLwkGGLsFZBgRyOcOdh0Da9PBi9XE9wWRZCyRg4lbZAL2xKr9MlPdGN7OyhdVuUqs5TQphCKn22X5pRXsbeZBJMX34TYhGzscQkrzuRf00A1nbE';
const pageId = '868669880008773'; // Replace with your Facebook Page ID

app.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error uploading file' });
      }

      const mediaData = req.file.buffer;

      // Create a form data object
      const formData = new FormData();
      formData.append('access_token', accessToken);
      formData.append('message', 'This is a post with binary media data');
      formData.append('source', mediaData, { filename: 'image.jpg', contentType: 'image/jpeg' });

      // Make a POST request to the Facebook Graph API
      const response = await axios.post(`https://graph.facebook.com/v13.0/${pageId}/photos`, formData, {
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
