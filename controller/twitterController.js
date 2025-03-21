const { TwitterApi } = require('twitter-api-v2');
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL
const client = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

const Cookies = require('cookies')

const {
  createRefreshToken,
  createAccessToken,
} = require("../utils/tokenCreate");

const axios = require('axios');

const User = require('../model/User');
const twitterFileUploader = require('../utils/twitterFileUploader');

const { setToken, cookieSet } = require('../utils/cookieSet');
let twitCodeVerifier = '';
let twitState = '';




const clientIdAndSecret = `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`;
const encodedClientIdAndSecret = Buffer.from(clientIdAndSecret).toString('base64');

//twitter login url generator api 
exports.twitterLoginController = async (req, res, next) => {
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, { scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] });

  console.log("🚀 ~ file: twitterController.js:23 ~ exports.twitterLoginController= ~ url:", url)
  twitCodeVerifier = codeVerifier;
  twitState = state;
  res.redirect(url);
}

exports.twitterLoginCallbackController = async (req, res, next) => {
  const { state, code } = req.query;
  const cookies = new Cookies(req, res);

  // Get the saved codeVerifier from session
  const codeVerifier = twitCodeVerifier
  const sessionState = twitState;
  try {
    if (!codeVerifier || !state || !sessionState || !code) {
      return res.status(400).send('You denied the app or your session expired!');
    }
    if (state !== sessionState) {
      return res.status(400).send('Stored tokens didnt match!');
    }

    // Step 3: Exchange code for access token
    const tokenResponse = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      new URLSearchParams({
        client_id: process.env.TWITTER_CLIENT_ID,
        client_secret: process.env.TWITTER_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: CALLBACK_URL,
        code,
        code_verifier: codeVerifier,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${encodedClientIdAndSecret}`, // Correct encoding!
        },
      }
    );

    const { access_token: accessToken, refresh_token: refreshToken, expires_in } = tokenResponse.data;

    // Step 4: Fetch user profile
    const userResponse = await axios.get("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = userResponse.data;
    console.log("🚀 ~ exports.twitterLoginCallbackController= ~ userData:", userData)
    // Example request
    const { id, name ,username } = userData;
    const isUser = await User.findOne({ 'twitter.id': id });

    const currentDate = new Date();
    const ExpireDate = new Date(currentDate.getTime() + (1000 * 60 * 60 * 2)); //2 hours
    let userId;
    if (isUser) {
      const update = {
        $set: {
          'twitter.name': name,
          'twitter.twitterAccessToken': accessToken,
          'twitter.twitterRefreshToken': refreshToken,
          'twitter.id': id,
          'twitter.accessTokenExpire': ExpireDate
        }
      };

      // Use async/await with findOneAndUpdate
      await User.findOneAndUpdate({ _id: isUser._id }, update);
      userId = isUser._id;
    } else {
      const user = new User({
        name,
        twitter: {
          id,
          name,
          twitterAccessToken: accessToken,
          twitterRefreshToken: refreshToken,
          accessTokenExpire: ExpireDate
        },
        linkedin: {},
        facebook: []
      })
      let newUser = await user.save();
      userId = newUser._id;
    }

    const refresh_token = createRefreshToken({ id: userId }, process.env.REFRESH_TOKEN_SECRET, '30d')
    const access_token = createAccessToken({ id: userId }, process.env.ACCESS_TOKEN_SECRET, '50m');



    //our own system cookies
    cookies.set('access_token', access_token, { httpOnly: false, expires: new Date(Date.now() + 1000 * 60 * 50) }) //50min
    cookies.set('refresh_token', refresh_token, { httpOnly: false, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) }) //30day

    res.redirect(process.env.LOGIN_REDIRECT_URL + `?access_token=${access_token}&refresh_token=${refresh_token}&twitter_access_token=${accessToken}; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)}`)



  } catch (error) {
    next(error);
  }



}

// twitter tweet post controller 
exports.twitterTweetPostController = async (req, res, next) => {
  const { twitter } = req.user;
  const { text, duration_minutes, options, twitter: x } = req.body;

  try {
    // const {twitter} = await User.findById(req.id);
    if (x != 'true' || !twitter.id) return next();

    const client2 = new TwitterApi(twitter.twitterAccessToken);


    if (text && duration_minutes && options) {  //this condition for text and  poll posting
      data = await client2.v2.tweet(text, {
        poll: {
          duration_minutes: Number.parseInt(duration_minutes),
          options//['Absolutely', 'For sure!'] 
        },
      });

    } else if (req.files.length) {              //this condition is for text and  media posting
      console.log('file');
      const mediaId = await twitterFileUploader(req.files[0].buffer)
      await client2.v2.tweet({ text, media: { media_ids: [mediaId] } });

    } else {                                  //this condition for just test posting 
      await client2.v2.tweet(text);
    }
    next()
  } catch (error) {
    next(error);
  }
};


exports.twitterTokenRefreshController = async (req, res, next) => {
  // Obtain the {refreshToken} from your DB/store
  const { client: refreshedClient, accessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token('QUNKU19mQ3YwTjJOSUY2R1p3SFhKeG9ieFdWOWxmN3o2WksyejVLUHFleFNXOjE2OTc3MDUzODk2NzU6MToxOnJ0OjE');
  // Store refreshed {accessToken} and {newRefreshToken} to replace the old ones

  // Example request
  let data = await refreshedClient.v2.me();
  res.json({
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
    data
  })
}

exports.twitterUserDataController = async (req, res, next) => {
  const endpoint = `https://api.twitter.com/2/users/${'1713443930044551168'}?user.fields=profile_image_url`;

  try {
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${'Z25fMjMzZU5Od05ZNmFPaVlHend6OGRTek5HaUFCUkltNlhFQ25KRUsxTkxBOjE3MDM3NjUxMDcxMjA6MTowOmF0OjE'}`,
      },
    });
    console.log("🚀 ~ file: twitterController.js:171 ~ exports.twitterUserDataController= ~ response:", response.data)
    if (response.data?.data?.profile_image_url) {
      return res.json(response.data.data.profile_image_url);
    } else {
      throw new Error("Profile image URL not found");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }


  //   const bearerToken = 'ZGFyTVJxc2ctOF9xRDJubHlOMnIzZFQ5cmhiU2pzYjB0US1hY0Y4M0ViWDlFOjE3MDMwNjQwNzE5MTA6MToxOmF0OjE'; // Replace with your actual Bearer Token
  // const userId = '1713443930044551168'; // Replace with the user's ID or username

  // const url = `https://api.twitter.com/2/users/${userId}`;
  // const headers = {
  //   Authorization: `Bearer ${bearerToken}`,
  // };

  // axios.get(url, { headers })
  //   .then((response) => {
  //     const userData = response.data.data;
  //     console.log('User Data:', userData);
  //   })
  //   .catch((error) => {
  //     console.error('Error:', error);
  //   });

  // res.send('ok')
}




