const { TwitterApi }=require('twitter-api-v2');
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL 
const client = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID ,
    clientSecret: process.env.TWITTER_CLIENT_SECRET ,
});

const Cookies = require('cookies')

const {
  createRefreshToken,
  createAccessToken,
} = require("../utils/tokenCreate");

const axios = require('axios');

const User = require('../model/User');
const twitterFileUploader = require('../utils/twitterFileUploader');

const {setToken, cookieSet} = require('../utils/cookieSet');

//twitter login url generator api 
exports.twitterLoginController = async (req, res, next) => {
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, { scope: ['tweet.read','tweet.write', 'users.read', 'offline.access'] });
  
  console.log("🚀 ~ file: twitterController.js:23 ~ exports.twitterLoginController= ~ url:", url)
  req.session.codeVerifier = codeVerifier;
  req.session.sessionState = state;
  // req.session.save();
  await req.session.save();

  let newUrl = 'https://twitter.com/i/oauth2/authorize?response_type=code&client_id=cnRtUXlndWdES0RlQmxaWUQtaC06MTpjaQ&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fapi%2Fv1%2Ftwitter%2Fcallback&state=46x7uvtlj1YmKGG43PVNm9DMN4llzEY8&code_challenge=6kXjpjJYNKjCT7gH47C3plx9Le7Xl6QYcCAITlXIyDY&code_challenge_method=s256&scope=tweet.read%20tweet.write%20users.read%20offline.access'
  console.log("🚀 ~ file: twitterController.js:23 ~ exports.twitterLoginController= ~ codeVerifier:", req.session.codeVerifier)
  res.redirect(newUrl);
}

exports.twitterLoginCallbackController = async (req,res,next) => {
  const { state, code } = req.query;
  const cookies = new Cookies(req, res);

  // Get the saved codeVerifier from session
  const codeVerifier = req.session.codeVerifier || '8AThWUXXpo_Bm1ym7JlyUpKkyQftXWCRZFGx8_wSpYwkjJHi4L1zE2L_VIy5E_VIlEbGpRq90zpCsjfNFkyHA~NPqkSKB~KMtg9UpyCw3_nFzSk4kue5hb7mUD508aSO';
  // console.log("🚀 ~ file: twitterController.js:36 ~ exports.twitterLoginCallbackController= ~ codeVerifier:", codeVerifier)
  const sessionState = req.session.sessionState;
  try {
    // if (!codeVerifier || !state || !sessionState || !code) {
  //   return res.status(400).send('You denied the app or your session expired!');
  // }
  // if (state !== sessionState) {
  //   return res.status(400).send('Stored tokens didnt match!');
  // }

  const { client: loggedClient, accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({ code, codeVerifier, redirectUri: CALLBACK_URL })
     
      // Example request
      const { data: userObject } = await loggedClient.v2.me();
      const {id,name} = userObject;
      const isUser = await User.findOne({'twitter.id':id});

      const currentDate = new Date();
      const ExpireDate = new Date(currentDate.getTime() + (1000 * 60 * 60 * 2)); //2 hours
      let userId;
      if(isUser){
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
         await User.findOneAndUpdate({ _id: isUser._id },update);
        userId = isUser._id;
      }else{
        const user = new User({
          name,
          twitter:{
            id,
            name,
            twitterAccessToken:accessToken,
            twitterRefreshToken:refreshToken,
            accessTokenExpire:ExpireDate
          },
          linkedin:{},
          facebook:[]
        })
        let newUser = await user.save();
        userId = newUser._id;
      }

  const refresh_token = createRefreshToken({id: userId}, process.env.REFRESH_TOKEN_SECRET,'30d')
  const access_token = createAccessToken({id: userId}, process.env.ACCESS_TOKEN_SECRET,'50m');



  //our own system cookies
  setToken(refresh_token, access_token,res);
  // cookies.set('access_token', access_token,{ expires: new Date(Date.now() + 1000 * 60 *60 *24*30) }) //30days
  // cookies.set('refresh_token', refresh_token,{ expires:  new Date(Date.now() + 1000 * 60 * 50)  }) //50 min

  
  // //social media cookies
  // cookies.set('twitter_AccessToken',accessToken,{ expires:  new Date(Date.now() + 1000 * 60 *60 *24*60)  }); //2 months

  // cookies.set('twitter_refreshToken',refreshToken,{ expires:  new Date(Date.now() + 1000 * 60 *60 *24*60)  });

  // res.status(201).json({
  //     status:200,
  //     message: 'User created successfully',
  //     refresh_token, 
  //     access_token,
  //     twitter_AccessToken:accessToken,
  //     twitter_refreshToken:refreshToken
  // })
  res.redirect(process.env.LOGIN_REDIRECT_URL)

  

  } catch (error) {
    next(error);
  }

  
  
}

// twitter tweet post controller 
exports.twitterTweetPostController = async (req,res,next) => {
  const {twitter} = req.user;
  const {text,duration_minutes,options,twitter:x} = req.body;
  
  try {
    // const {twitter} = await User.findById(req.id);
    if(x != 'true' || !twitter.id ) return next();
    
    const client2 = new TwitterApi(twitter.twitterAccessToken);
    
    
    if(text && duration_minutes && options){  //this condition for text and  poll posting
      data =  await client2.v2.tweet(text,{
        poll: { 
          duration_minutes: Number.parseInt(duration_minutes),
          options//['Absolutely', 'For sure!'] 
        },
      });
      
    }else if(req.files.length){              //this condition is for text and  media posting
      console.log('file');
      const  mediaId = await twitterFileUploader(req.files[0].buffer)
      await client2.v2.tweet({text,media: { media_ids: [mediaId] }});
      
    }else{                                  //this condition for just test posting 
      await client2.v2.tweet(text);
    }
    next()
  } catch (error) {
     next(error);
  }
};


exports.twitterTokenRefreshController = async (req, res, next) =>{
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

exports.twitterUserDataController = async (req,res,next) => {
  const endpoint = `https://api.twitter.com/2/users/by/username/${'LmHossain26919'}?user.fields=profile_image_url`;

  try {
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${'ZGFyTVJxc2ctOF9xRDJubHlOMnIzZFQ5cmhiU2pzYjB0US1hY0Y4M0ViWDlFOjE3MDMwNjQwNzE5MTA6MToxOmF0OjE'}`,
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




