const { AuthClient,RestliClient } = require('linkedin-api-client');

const params = {
  clientId:'86ushza2suvs3a',
  clientSecret:'i2EN5Vq8AKlPcb7h',
  redirectUrl: 'http://localhost:3000/auth/linkedin/callback',
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

    const  token = await  authClient.exchangeAuthCodeForAccessToken(code)
    
    // user info
    restClient.get({
      resourcePath: '/userinfo',
      accessToken: token.access_token
    }).then(response => {
      const profile = response.data;
      console.log("🚀 ~ file: linkedinController.js:37 ~ exports.linkedinCallbackUrlController= ~ profile:", profile)
    });
    res.json(token)
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

