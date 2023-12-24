// const express = require('express');
// const multer = require('multer');
// const axios = require('axios');
// const FormData = require('form-data');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// // Set up multer to handle file uploads
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage }).single('image');

// const accessToken = 'EABImtNdQ8q4BO5LSQ5qCo1OqzSzkOHADYOIqSwM7sZBMPwZCe1xnrxZAlPMtGRy2PP001WdON6YGEXmDZAqQUDTOlLLq0v2Nu9WVMEbhlLTHAZAcuTZAtZAtj0tXeRtEHKx1zfGW3C9lEy4xcwjjU1DZCyh46hT8yfTCZA4PBdRAzYjBZBQdbY650FP5SfZAGuZAqJSUJlVKrZCtTkm4Don3VM4JwDU8NTAP31ZBFuTwKT19owIbml6EQeYOnu7XZCnpj7pOPJzGzMmGUCx3LUZD'; // Access token with the 'instagram_graph_user_media' permission
// const pageId = '17841462256382769';

// app.post('/upload', (req, res) => {
//   upload(req, res, async (err) => {
//     try {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Error uploading file' });
//       }

//       const mediaData = req.file ? req.file.buffer : null;
//       console.log("🚀 ~ file: instagramfileUpload.js:26 ~ upload ~ mediaData:", mediaData)

//       // Create a form data object
//       const formData = new FormData();
//       formData.append('access_token', accessToken);
//       formData.append('caption', 'This is a caption for your Instagram post');
//       formData.append('media_type', 'IMAGE');
//       formData.append('source', mediaData, { filename: 'image.png', contentType: 'image/png' });

      
//       // Make a POST request to the Facebook Graph API
//       console.log();
//       const response = await axios.post(`https://graph.facebook.com/v18.0/17841462256382769/photos`, formData, {
//           headers: {
//               ...formData.getHeaders(),
//             },
//         });
//         console.log('here');

//       // Log the response from Facebook
//       console.log(response.data);

//       // Post to Instagram
//       const mediaId = response.data.id;
//       await axios.post(`https://graph.facebook.com/v13.0/${pageId}/publish`, {
//         access_token: accessToken,
//       });

//       console.log('Post successfully published to Instagram');
//       res.status(200).json({ message: 'Post successfully published to Instagram' });
//     } catch (error) {
//       console.error('Error:', error.message);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });





const userId = '17841462256382769'; // Instagram Business or Creator Account ID
const accessToken = 'EABImtNdQ8q4BO5zrVS4v3qEH79c4cv048ImVN4Unv1eTgX2bPjwgS9YpvE5K0YaXZAmkAY2k0IS34gpJU2GfcqqBEMoXjWhr1MbYLFtyGVteaZAj9SZAVr7HNsvDbKoI9xnEgPH6dlPmLoLEnQJKYERTeFblvUFcL7XViCzFBPP9vZAVCMaYXZCa4ZCEFIZCnsg1nLooMiFXVLBQblo3eYldoMiE5W3OY6rcYL3faPJJIaBZC1Uzt8eIVqwmvtxtUCS2IplBirtEu0eP'; // User Access Token with 'instagram_content_publish' permission

// Set up Multer to handle file uploads
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 3000;

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload route
app.post('/upload', upload.single('image'), async (req, res) => {
    const apiVersion = 'v12.0';
    const igUserId = '17841462256382769';
    const caption = '#HelloWorld';
    

    // Check if the file was provided
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const url = `https://graph.facebook.com/${apiVersion}/${igUserId}/media`;

    const formData = {
        media_type: 'IMAGE',
        caption: caption,
        access_token: accessToken,
        file: {
            value: req.file.buffer,
            options: {
                filename: req.file.originalname,
                contentType: req.file.mimetype
            }
        }
    };

    try {
        const response = await axios.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const result = response.data;
        return res.json({ message: 'Post uploaded successfully', containerId: result.id });
    } catch (error) {
        return res.status(error.response?.status || 500).json({
            error: 'Failed to upload post',
            details: error.response?.data || 'Unknown error'
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

