const { AuthClient,RestliClient } = require('linkedin-api-client');
var Cookies = require('cookies');
const axios = require('axios');
const User = require('../model/User');
const {
  createRefreshToken,
  createAccessToken,
} = require("../utils/tokenCreate");

const {setToken, cookieSet} = require('../utils/cookieSet');
const linkedinFileUploader = require('../utils/linkedinFileUploader');


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
  const { code } = req.query;
  const cookies = new Cookies(req, res);

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

    const currentDate = new Date();
        const ExpireDate = new Date(currentDate.getTime() + (1000 * 60 * 60 * 24 * 90));
    if(userInfo){
      const update = {
        $set: {
          'linkedin.email': user.data.email,
          'linkedin.name': user.data.name,
          'linkedin.proPic': user.data.picture,
          'linkedin.accessToken': token.access_token,
          'linkedin.expiresInAccessToken':ExpireDate,
          'linkedin.refreshToken': token.refresh_token,
          'linkedin.expiresInRefreshToken': token.refresh_token_expires_in,
          'linkedin.userId': user.data.sub
        }
      };
  
      // Use async/await with findOneAndUpdate
       await User.findOneAndUpdate({ _id: userInfo._id },update);
       const refresh_token = createRefreshToken({id: userInfo._id}, process.env.REFRESH_TOKEN_SECRET,'30d')
       const access_token = createAccessToken({id: userInfo._id}, process.env.ACCESS_TOKEN_SECRET,'50m');

      //our own system cookies
      cookies.set('access_token', access_token,{ httpOnly:false, expires: new Date(Date.now() + 1000 * 60 *50) }) //50min
      cookies.set('refresh_token', refresh_token,{ httpOnly:false, expires:  new Date(Date.now() + 1000 * 60 *60 *24*30)  }) //30day

      res.redirect(process.env.LOGIN_REDIRECT_URL)

    }else{
      //user signup 
      const userSignUp = new User({
        email: user.data.email,
        name:user.data.name,
        linkedinEmail: user.data.email,
        linkedin:{
          email:user.data.email,
          name:user.data.name,
          proPic:user.data.picture,
          accessToken:token.access_token,
          expiresInAccessToken:ExpireDate,
          refreshToken:token.refresh_token,
          expiresInRefreshToken:token.refresh_token_expires_in,
          userId:user.data.sub
        }
      })

    const newUser =  await userSignUp.save();
    // login user
    const refresh_token = createRefreshToken({id: newUser._id}, process.env.REFRESH_TOKEN_SECRET,'30d')
    const access_token = createAccessToken({id: newUser.id}, process.env.ACCESS_TOKEN_SECRET,'50m');

    //our own system cookies
    //our own system cookies
    cookies.set('access_token', access_token,{ httpOnly:false, expires: new Date(Date.now() + 1000 * 60 *50) }) //50min
    cookies.set('refresh_token', refresh_token,{ httpOnly:false, expires:  new Date(Date.now() + 1000 * 60 *60 *24*30)  }) //30day
    
    res.redirect(process.env.LOGIN_REDIRECT_URL)
  }
     
   
  } catch (error) {
    next(error)
  }

    
}


exports.postInLinkedInController = async(req, res, next) => {
  const {linkedin} = req.user;
  const {text,linkedin:ldIn} = req.body;
  try {
    if(ldIn != 'true' || !linkedin.userId){
      console.log('inkedIn is empty');
      return  next();
    }

    if(req.files.length){ // image or video post functionality
      console.log('image');
      await linkedinFileUploader(linkedin.accessToken,linkedin.userId,text,req.files[0].buffer);
    }else{ // just text post functionality
      console.log('else');
      let payload = {
        resourcePath: '/ugcPosts',
        entity: {
          author: `urn:li:person:${linkedin.userId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text  // text post 
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        },
        accessToken:linkedin.accessToken
      }
      const ugcPostsCreateResponse = await restClient.create(payload);
    }
    
    next();
  } catch (error) {
    next(error)
  }
  
}

