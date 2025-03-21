const express = require('express');
const multer = require('multer');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const port = 3000;

// Set up multer to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

// Replace these with your Twitter API credentials
const TWITTER_CONSUMER_KEY = 'O1W2ymelwXRtngy3rPLBHUZaR';
const TWITTER_CONSUMER_SECRET = 'n0ERVoqgIRXVXnbzSlfPflZSX1FKr7QyB2QhGi5qyEGdGZubKT';
const TWITTER_ACCESS_TOKEN = '1713443930044551168-RufYUWr65yU6q5wegywtE6ysF7a5nJ';
const TWITTER_ACCESS_TOKEN_SECRET = '9uDYWSmLMj6eYZwPgNorSry19MeHtSdESOU6S635PoJ3D';

app.post('/upload',upload.single('image'), async (req, res) => {
  try {
    // Handle the file upload using multer
   

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
      const base64Image = req.file.buffer.toString('base64');



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

      const ans = result.data;

      console.log('ans', ans);

      res.status(201).send({ message: 'Media created' });
  } catch (error) {
    console.log('error', error);
    console.log('error.message', error.message);
    res.status(403).send({ message: 'Missing, invalid, or expired tokens' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
