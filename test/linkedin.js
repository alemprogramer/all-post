const axios = require('axios');
const express = require('express');
const multer = require('multer');
const uploader = require('../middleware/uploader')

const app = express();
const port = 3000;

const accessToken = 'AQVrymGZCtJDSaOdIP7oFrlaPH1aar4AexgQ1nB9ot8b13bIWqO7rveLR9Zu2ZdoIrqwnamtxyApDdCy_PL8j7J_jsKYa11XLbr9weE9mveIjgcZADAOCM032xLx0hiD45t3MhAHISihxQR0JHK7dP2cAaHEzuZDzWMz_RU0q8S45EmUfekc08SYH1_-syXrD833b-bIITcdfepaYF32lIlkb18uqt_ah8bSKlr9NJL-lqm2KGMeuVIufnXlnyiQF4C86rESkkyRaD_msFny-_FiCnr3vVg7_qf3RjhKKAVO0CUth0-Y682fe-wotNq6x9b1yVJeUbh8SI1ZvolI4dH8TM3uaw';
const personURN = 'urn:li:person:8EpntNPLVX';
const textContent = 'Feeling inspired after meeting so many talented individuals at this year\'s conference. #talentconnect';

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Step 1: Register the Image
async function registerImage() {
    try {
        const registerUrl = 'https://api.linkedin.com/v2/assets?action=registerUpload';
        const registerPayload = {
            registerUploadRequest: {
                recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                owner: personURN,
                serviceRelationships: [
                    { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }
                ]
            }
        };

        const registerHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };

        const registerResponse = await axios.post(registerUrl, registerPayload, { headers: registerHeaders });        
        const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
        console.log("🚀 ~ file: linkedin.js:38 ~ registerImage ~ uploadUrl:", uploadUrl)
        const assetId = registerResponse.data.value.asset;

        return { uploadUrl, assetId };
    } catch (error) {
        throw error;
    }
}

// Step 2: Upload Image Binary File using Multer
async function uploadImage(req, uploadUrl) {
    console.log('here');
    try {
        console.log("🚀 ~ file: linkedin.js:52 ~ uploadImage ~ req.file:", req.file)
        const imageBuffer = req.file.buffer;
        const uploadResponse = await axios.post(uploadUrl, imageBuffer, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/octet-stream',
            },
        });

        return uploadResponse.data;
    } catch (error) {
        throw error;
    }
}

// Step 3: Create the Image Share
async function createImageShare(assetId) {
    try {
        const createUrl = 'https://api.linkedin.com/v2/ugcPosts';
        const createPayload = {
            author: personURN,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: { text: textContent },
                    shareMediaCategory: 'IMAGE',
                    media: [
                        {
                            status: 'READY',
                            media: assetId,
                            description: { text: 'Center stage!' },
                            title: { text: 'LinkedIn Talent Connect 2021' }
                        }
                    ]
                }
            },
            visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' }
        };

        const createHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
        };

        const createResponse = await axios.post(createUrl, createPayload, { headers: createHeaders });
        console.log("🚀 ~ file: linkedin.js:97 ~ createImageShare ~ createResponse:", createResponse.data)

        if (createResponse.status === 201) {
            console.log('Post created successfully!');
        } else {
            console.error('Error creating post:', createResponse.data);
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Multer middleware for handling image uploads
app.post('/upload', uploader.single('file'), async (req, res) => {
    try {
        const { uploadUrl, assetId } = await registerImage();
        await uploadImage(req, uploadUrl);
        let data = await createImageShare(assetId);
        console.log("🚀 ~ file: linkedin.js:114 ~ app.post ~ data:", data)
        res.status(200).send('Post created successfully!');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



//https://media.licdn.com/dms/image/D4D22AQHO_ubVxZ7F6A/feedshare-shrink_800/0/1702979843400?e=1706140800&v=beta&t=Ztv6Oe6yBFja_k0uy31GNLnqAY5EBXHShLlBCahjhJQ
//https://api.linkedin.com/mediaUpload/sp/D4D22AQHO_ubVxZ7F6A/uploaded-image/0?ca=vector_feedshare&cn=uploads&m=AQKQ72nxNqlE8wAAAYyBgi2M5xofhkisTV0PJnaUq29dF0wIl_f_5V7toA&app=213900245&sync=0&v=beta&ut=2Yy93-uyol5X41