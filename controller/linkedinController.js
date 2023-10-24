const { AuthClient,RestliClient } = require('linkedin-api-client');
const User = require('../model/User');
const bcrypt = require("bcrypt");
const {
  createRefreshToken,
  createAccessToken,
} = require("../utils/tokenCreate");

const params = {
  clientId:process.env.LINKEDIN_CLIENTID,
  clientSecret:process.env.LINKEDIN_CLIENT_SECRET,
  redirectUrl: process.env.LINKEDIN_CALLBACK_URL,
  enabled:true,
  logSuccessResponses:true,
  
}
const authClient = new AuthClient(params);
const restClient = new RestliClient();

exports.linkedinLoginController = async (req, res,next) => {
  let scopes = [
    'profile', 
    'email',
    'openid', 
    'w_member_social',
     
   ]
 const url =  authClient.generateMemberAuthorizationUrl(scopes)
 res.redirect(url)
}

exports.linkedinCallbackUrlController = async (req,res,next)=>{
  const { code } = req.query

  try {
    const  token = await  authClient.exchangeAuthCodeForAccessToken(code)
    
    // user info
    const user = await restClient.get({resourcePath: '/userinfo',accessToken: token.access_token})

    const userInfo = await User.findOne({
      $or: [
        { email: user.data.email },
        { linkedinEmail: user.data.email }
      ]
    });
    const {email,sub} = user.data;// using for password

    if(userInfo){

    }else{
      //user signup 
      const userSignUp = new User({
        email: user.data.email,
        name:user.data.name,
        linkedinEmail: user.data.email,
        linkedin:{
          email:user.data.email,
          linkedinId: await bcrypt.hash(email+sub, 11),// working for password
          name:user.data.name,
          proPic:user.data.picture,
          accessToken:token.access_token,
          expiresInAccessToken:token.expires_in,
          refreshToken:token.refresh_token,
          expiresInRefreshToken:token.refresh_token_expires_in,
          userId:user.data.sub
        }
      })

      const newUser =  await userSignUp.save();

        // login user
      const refresh_token = createRefreshToken({id: newUser._id}, process.env.REFRESH_TOKEN_SECRET,'30d')
    
      const access_token = createAccessToken({id: newUser.id}, process.env.ACCESS_TOKEN_SECRET,'50m');

      setToken(refresh_token, access_token,res);
    

    }
     res.status(200).json({
      success:200,
      message: 'user signed up successfully'
     })
   
  } catch (error) {
    next(error)
  }

    
}

exports.postInLinkedInController = async(req, res, next) => {
  const ugcPostsCreateResponse = await restClient.create({
    resourcePath: '/ugcPosts',
    entity: {
      author: `urn:li:person:${`8EpntNPLVX`}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: 'Sample text post created with /ugcPosts23 API from linkedin api'
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    },
    accessToken:'AQViXcV9Icknm_eu0C0YvFxQkbE_flGQdEClA10Km04-pH1z96TQJP4D2y4BdOzw9XEfho9PxVML2rBjQcPN9MqdeUO5V8CzjW9InsQlZTK7nj2m4YMFzJHRl9T8Jed2Og4dWeTHojQf-frVN6Zvh3fnsu56ApyP2vYIIQ5mpPKemgg_kdCJ21Pf370Fd3yjVM4-4saNJhwUwjxk2atbIsirUG6yc5hRbSiizG5yn4c0AM5JoiKAirq98HjDTnPG_3TKam9-z2B8N6ABazc9Zi0qFgHMlx689iF1aeyHPmT2mRry6p-syd7-9HSc2l_E9Ic2bK_YQJoe8mDz1c1iXq3z4YmTHw'
  });
  console.log("🚀 ~ file: linkedinController.js:62 ~ exports.postInLinkedInController=async ~ ugcPostsCreateResponse:", ugcPostsCreateResponse.data)
  res.json(ugcPostsCreateResponse.data)
}

