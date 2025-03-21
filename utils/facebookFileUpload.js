const axios = require('axios');
const FormData = require('form-data');

exports.fileUploadOnFacebookPAge = (pageId,accessToken,req)=>{
    return new Promise(async (resolve,reject)=>{
        try {
            const mediaData = req.files[0].buffer;
            const filename = req.files[0].originalname;
            const contentType = req.files[0].mimetype

            // Create a form data object
            const formData = new FormData();
            formData.append('access_token', accessToken);
            formData.append('message', req.body.text);
            formData.append('source', mediaData, { filename, contentType });

            // Make a POST request to the Facebook Graph API
            const response = await axios.post(`https://graph.facebook.com/v13.0/${pageId}/photos`, formData, {
                headers: {
                ...formData.getHeaders(),
                },
            });

            // Log the response from Facebook
            resolve({
                message: "post created successfully",
                data: response.data
            })
        } catch (error) {
            reject(error)
        }
    })
}

exports.instagramImageUrlForPost = (postId,accessToken)=>{
    return new Promise(async (resolve, reject)=>{
        console.log("🚀 ~ file: facebookFileUpload.js:57 ~ return new Promise ~ postId:", postId)
        console.log("🚀 ~ file: facebookFileUpload.js:57 ~ return new Promise ~ accessToken:", accessToken)
        try {
            const response = await axios.get(
              `https://graph.facebook.com/v13.0/${postId}`,
              {
                params: {
                  access_token: accessToken,
                  fields: 'full_picture', // Add more fields as needed
                },
              }
            );
        
            const postDetails = response.data.full_picture;
            resolve(postDetails)
          } catch (error) {
            reject(error.message);
          }
    })
        
}