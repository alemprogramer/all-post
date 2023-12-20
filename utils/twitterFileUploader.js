const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const axios = require('axios');

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY 
const TWITTER_CONSUMER_SECRET =process.env.TWITTER_CONSUMER_SECRET 
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN 
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET


module.exports = (buffer)=>{
    return new Promise(async (resolve,reject)=>{
        try {
            const oauth = OAuth({
              consumer: {
                key: process.env.TWITTER_CONSUMER_KEY || TWITTER_CONSUMER_KEY,
                secret: process.env.TWITTER_CONSUMER_SECRET || TWITTER_CONSUMER_SECRET,
              },
              signature_method: 'HMAC-SHA1',
              hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64'),
            });
      
            const token = {
              key: TWITTER_ACCESS_TOKEN,
              secret: TWITTER_ACCESS_TOKEN_SECRET,
            };
      
            // Use req.file.buffer directly from multer for the image data
            const base64Image = buffer.toString('base64');
      
      
      
            let body = { media_data: base64Image };
      
            const requestData = {
              url: 'https://upload.twitter.com/1.1/media/upload.json',
              method: 'POST',
              data: body,
            };
      
            const authHeader = oauth.toHeader(oauth.authorize(requestData, token));
          //   body = percentEncode(querystring.stringify(body));
            const result = await axios.post(requestData.url, body, {
              headers: {
                Authorization: authHeader['Authorization'],
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
              },
            });
                
            resolve(result.data.media_id_string)
        } catch (error) {
          reject(error);
        }
    })
}