const axios = require('axios');


async function linkedinFileUploader(accessToken,userURN,textContent,buffer){//token,userId,text,file-buffer
    console.log("🚀 ~ file: linkedinFileUploader.js:5 ~ linkedinFileUploader ~ buffer:", buffer)
    const personURN = `urn:li:person:${userURN}`;


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
    async function uploadImage(buffer, uploadUrl) {
        try {
            const imageBuffer = buffer;
            const uploadResponse = await axios.post(uploadUrl, imageBuffer, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/octet-stream',
                },
            });
            return uploadResponse.data;
        } catch (error) {
            console.log('uploadImage',error);
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
    try {
        const { uploadUrl, assetId } = await registerImage();
        await uploadImage(buffer, uploadUrl);
        await createImageShare(assetId);
    } catch (error) {
        console.error('Error:', error);
        
    }

}

module.exports = linkedinFileUploader







//https://media.licdn.com/dms/image/D4D22AQHO_ubVxZ7F6A/feedshare-shrink_800/0/1702979843400?e=1706140800&v=beta&t=Ztv6Oe6yBFja_k0uy31GNLnqAY5EBXHShLlBCahjhJQ
//https://api.linkedin.com/mediaUpload/sp/D4D22AQHO_ubVxZ7F6A/uploaded-image/0?ca=vector_feedshare&cn=uploads&m=AQKQ72nxNqlE8wAAAYyBgi2M5xofhkisTV0PJnaUq29dF0wIl_f_5V7toA&app=213900245&sync=0&v=beta&ut=2Yy93-uyol5X41