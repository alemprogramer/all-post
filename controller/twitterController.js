const { TwitterApi }=require('twitter-api-v2');
const CALLBACK_URL = 'http://127.0.0.1:3000/auth/twitter/callback'
const client = new TwitterApi({
    clientId: 'cnRtUXlndWdES0RlQmxaWUQtaC06MTpjaQ',
    clientSecret: 'LhBS1CfzRfi-bed2XQt5VcBDH4b_NbpVZ31xg7Q8ZuXppXs3hX',
});

//twitter login url generator api 
exports.twitterLoginController = async (req, res, next) => {
  const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, { scope: ['tweet.read','tweet.write', 'users.read', 'offline.access'] });
  // Redirect your user to {url}, store {state} and {codeVerifier} into a DB/Redis/memory after user redirection
  res.json({
      url,
      codeVerifier,
      state,
  })
}

exports.twitterLoginCallbackController = async (req,res) => {
  const { state, code } = req.query;
  // Get the saved codeVerifier from session

  const codeVerifier = "A~xaoW__dVCQ9JKF~Sr2jS_vWXG01AaPc5Kbk4OqjkTb5WnNeR~E9Qrt1jobMotFvPAOVW.sbzGCu_GkBsML6cTv9y3SpHcktePTtmm7EsQin2WCrn_PD06ZLFyRP552" //TODO: data save in data and get from it
  const sessionState = "6WdX1el0FQsGk~OmBqBK.YKisUr54r4n"  //TODO: data save in data and get from it  


  if (!codeVerifier || !state || !sessionState || !code) {
    return res.status(400).send('You denied the app or your session expired!');
  }
  if (state !== sessionState) {
    return res.status(400).send('Stored tokens didnt match!');
  }


  client.loginWithOAuth2({ code, codeVerifier, redirectUri: CALLBACK_URL })
    .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
      console.log("🚀 ~ file: facebookRouter.js:111 ~ .then ~ refreshToken:", refreshToken)//TODO: data save in data and get from it
      console.log("🚀 ~ file: facebookRouter.js:111 ~ .then ~ accessToken:", accessToken)//TODO: data save in data and get from it
      // {loggedClient} is an authenticated client in behalf of some user
      // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
      // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

      // Example request
      const { data: userObject } = await loggedClient.v2.me();

      
      console.log("🚀 ~ file: facebookRouter.js:119 ~ .then ~ userObject:", userObject)
    })
    .catch(() => res.status(403).send('Invalid verifier or access tokens!'));

  res.send('ok')
  
}

// twitter tweet post controller 
exports.twitterTweetPostController = async (req,res,next) => {
  const client = new TwitterApi('Z3QtQjV5UUh3X1NKNS0tRlVRNUY2RmlaU0Q1YVZ6TERBWHVxUnV3VkxkSEFyOjE2OTc3MDc2MTMyNjM6MToxOmF0OjE');//TODO: give accessToken value from database

  let data =  await client.v2.tweet('twitter-api-v215 is awesome! from Hasib');//TODO: tweet test 
  //TODO:  adding image and poll
  res.json(data);
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



