const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

const apiVersion = 'v18.0';
// const appId = process.env.FACEBOOK_APP_ID;
// console.log("🚀 ~ file: fb.js:10 ~ appId:", appId)
// console.log("🚀 ~ file: fb.js:10 ~ appId:", process.env.PORT)

const accessToken = 'EABImtNdQ8q4BO6gk9dzRpGX1nkGIAkn3Qno8THFsbn6v9MFE3731b0FcaqwXaH38Ysj305xqqG2VkPTbvjLykp9AxQkZAmha2ZB2OKS6YrouldqkRuc325NO4YE3rCCBIF80SCV9GyQZCccnZBMSw7J6aSQZBUAHxGr1iB2XbYj2iBH3cPNopIt84FDNb6YGvmxUdJQ8NUi0r3nn2Hn7zWzg2n8ySmFS7OjK829eC78zRciXhdV0i7XnogDoZB9r7ZBiQZDZD';

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Step 1: Create a Session
async function createUploadSession(fileLength, fileType) {
    

    try {
        const createSessionUrl = `https://graph.facebook.com/v18.0/5109107729167022/uploads`;
        const queryParams = `file_length=${fileLength}&file_type=${fileType}&access_token=${accessToken}`;

        const createSessionResponse = await axios.post(`${createSessionUrl}?${queryParams}`);
        const uploadSessionId = createSessionResponse.data.id;
        console.log("🚀 ~ file: fb.js:28 ~ createUploadSession ~ createSessionResponse:", createSessionResponse.data)


        return uploadSessionId;
    } catch (error) {
        console.log('createUploadSession',error);
    }
}

// Step 2: Initiate Upload
async function initiateUpload(uploadSessionId, fileBuffer) {
    try {
        const initiateUploadUrl = `https://graph.facebook.com/${apiVersion}/${uploadSessionId}`;
        const initiateUploadHeaders = {
            'Authorization': `OAuth ${accessToken}`,
            'file_offset': 0,
        };
        

        const initiateUploadResponse = await axios.post(initiateUploadUrl, fileBuffer, {
            headers: {
                ...initiateUploadHeaders,
                'Content-Type': 'application/octet-stream',
            },
        });
        const fileHandle = initiateUploadResponse.data.h;
        console.log('print',initiateUploadResponse.data);

        
            
                const getUrl = `https://graph.facebook.com/v18.0/${initiateUploadResponse.data.h}?access_token=${accessToken}`;
        
                const response = await axios.get(getUrl);
                console.log("🚀 ~ file: fb.js:66 ~ initiateUpload ~ response:", response.data)
        

        return fileHandle;
    } catch (error) {
        console.log("initiateUpload",error.message);

    }
}

// Route to handle file upload
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const fileBuffer = req.file.buffer;
        const fileLength = req.file.size;
        const fileType = req.file.mimetype;

        const uploadSessionId = await createUploadSession(fileLength, fileType);
        console.log('out');
        const fileHandle = await initiateUpload(uploadSessionId, fileBuffer);

        res.status(200).json({ message: 'File uploaded successfully!', fileHandle });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});





