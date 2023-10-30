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

const User = require('../model/User')

//twitter login url generator api 
exports.twitterLoginController = async (req, res, next) => {
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, { scope: ['tweet.read','tweet.write', 'users.read', 'offline.access'] });
  req.session.codeVerifier = codeVerifier;
  req.session.sessionState = state;
  req.session.save();

  res.redirect(url);
}

exports.twitterLoginCallbackController = async (req,res,next) => {
  const { state, code } = req.query;
  const cookies = new Cookies(req, res);

  // Get the saved codeVerifier from session
  const codeVerifier = req.session.codeVerifier;
  const sessionState = req.session.sessionState;
  try {
    // if (!codeVerifier || !state || !sessionState || !code) {
  //   return res.status(400).send('You denied the app or your session expired!');
  // }
  // if (state !== sessionState) {
  //   return res.status(400).send('Stored tokens didnt match!');
  // }

  const { client: loggedClient, accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({ code, codeVerifier, redirectUri: CALLBACK_URL })
  
      console.log("🚀 ~ file: facebookRouter.js:111 ~ .then ~ refreshToken:", refreshToken)//TODO: data save in data and get from it
      console.log("🚀 ~ file: facebookRouter.js:111 ~ .then ~ accessToken:", accessToken)//TODO: data save in data and get from it
    
   
      // Example request
      const { data: userObject } = await loggedClient.v2.me();
      console.log("🚀 ~ file: twitterController.js:50 ~ exports.twitterLoginCallbackController= ~ userObject:", userObject)
      const {id,name} = userObject;
      const isUser = await User.findOne({'twitter.id':id}) 
      
      let userId;
      if(isUser){
        console.log(isUser);
        userId = isUser._id;
      }else{
        const user = new User({
          name,
          twitter:{
            id,
            name,
            twitterAccessToken:accessToken,
            twitterRefreshToken:refreshToken
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
  cookies.set('access_token', access_token,{ expires: new Date(Date.now() + 1000 * 60 *60 *24*30) }) //30days
  cookies.set('refresh_token', refresh_token,{ expires:  new Date(Date.now() + 1000 * 60 * 50)  }) //50 min
  
  //social media cookies
  cookies.set('twitter_AccessToken',accessToken,{ expires:  new Date(Date.now() + 1000 * 60 *60 *24*60)  }); //2 months

  cookies.set('twitter_refreshToken',refreshToken,{ expires:  new Date(Date.now() + 1000 * 60 *60 *24*60)  });

  res.status(201).json({
      status:200,
      message: 'User created successfully',
      refresh_token, 
      access_token,
      twitter_AccessToken:accessToken,
      twitter_refreshToken:refreshToken
  })

  } catch (error) {
    next(error);
  }

  
  
}

// twitter tweet post controller 
exports.twitterTweetPostController = async (req,res,next) => {

  try {
    const client2 = new TwitterApi('WElPWThzaTUxTjBiNW9JdkVPRURzQU84Z1RRNjcydXNVOVVIU3EtdE93RHVfOjE2OTgxNTM3OTE0OTA6MToxOmF0OjE');//TODO: give accessToken value from database

  let data =  await client2.v2.tweet('twitter-api-v215 is awesome! from Hasib');//TODO: tweet test 
  //TODO:  adding image and poll


  res.json(data);
  } catch (error) {
    next(error);
  }
  
};


exports.twitterTokenRefreshController = async (req, res, next) =>{
// Obtain the {refreshToken} from your DB/store
const { client: refreshedClient, accessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token('QUNKU19mQ3YwTjJOSUY2R1p3SFhKeG9ieFdWOWxmN3o2WksyejVLUHFleFNXOjE2OTc3MDUzODk2NzU6MToxOnJ0OjE');
console.log("🚀 ~ file: twitter.js:77 ~ refreshToken ~ accessToken:", accessToken)

// Store refreshed {accessToken} and {newRefreshToken} to replace the old ones

// Example request
let data = await refreshedClient.v2.me();
console.log("🚀 ~ file: twitter.js:83 ~ refreshToken ~ data:", data)
res.json({
  client: refreshedClient,
  accessToken, 
  refreshToken: newRefreshToken,
  data 
})
}

exports.twitterUserDataController = async (req,res,next) => {
  // const endpoint = `https://api.twitter.com/2/users/by/username/${'LmHossain26919'}?user.fields=profile_image_url`;

  // try {
  //   const response = await axios.get(endpoint, {
  //     headers: {
  //       Authorization: `Bearer ${'UHc0MkFSbFdCZko3MVRhVC1jYm0wVW5ib0VNaFhXU245OUtEYXB5ZkFTQUNvOjE2OTgxNTY5OTU5NTM6MToxOmF0OjE'}`,
  //     },
  //   });
  //   if (response.data?.data?.profile_image_url) {
  //     return res.json(response.data.data.profile_image_url);
  //   } else {
  //     throw new Error("Profile image URL not found");
  //   }
  // } catch (error) {
  //   console.error(error);
  //   next(error);
  // }


  const bearerToken = 'enQ4WHVUdE5DQ21SUk13SUNneWJQTDdtYm13N1NSOWRlcldiTGNlOERMY09xOjE2OTgxNTkwODUyMzE6MTowOmF0OjE'; // Replace with your actual Bearer Token
const userId = '1713443930044551168'; // Replace with the user's ID or username

const url = `https://api.twitter.com/2/users/${userId}`;
const headers = {
  Authorization: `Bearer ${bearerToken}`,
};

axios.get(url, { headers })
  .then((response) => {
    const userData = response.data.data;
    console.log('User Data:', userData);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

  res.send('ok')
}




