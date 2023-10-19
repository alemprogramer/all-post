const router = require('express').Router();
const passport = require('../middleware/passport')
const Twit = require('twit')
const axios = require('axios')


const { fbLongLiveAccessTokenController,fbLoginCallBackController,facebookPostController } = require('../controller/facebookController');

router.get('/fb-refresh-token', fbLongLiveAccessTokenController);
router.get('/facebook',passport.authenticate('facebook'));
router.get('/facebook/callback', passport.authenticate('facebook'),fbLoginCallBackController);
router.get('/facebook/post',facebookPostController)

router.get('/linkedin', passport.authenticate('linkedin'));
  
  router.get('/linkedin/callback',
    passport.authenticate('linkedin'),(req,res) => {
        console.log('ok');
        res.send('ok');
    });


// router.get('/twitter', passport.authenticate('twitter',{ scope: ["offline.access"] }));
// router.get('/twitter/callback', passport.authenticate('twitter'),async (req,res) => {
//     console.log(req.query);


//     // try {
//     //     const resp = await axios.post(
//     //         'https://api.twitter.com/oauth2/token',
//     //         '',
//     //         {
//     //             params: {
//     //                 'grant_type': 'client_credentials'
//     //             },
//     //             auth: {
//     //                 username:  'RqmeYeipJjDqwZ1nia0NB9oel',
//     //                 password:  'aEG4aqpBVsZiscmjluLPrEBGRplvjBNk4xoTsf5NWFRDxPTUlK'
//     //             }
//     //         }
//     //     );
//     //     res.send('ok');
//     //     console.log(resp.data);
//     // } catch (err) {
//     //     // Handle Error Here
//     //     console.error(err);
//     //     res.json({'error':err});
//     // }

//     res.send('ok');
// //     const access_token = req.query.oauth_token;
// //     const access_token_secret = req.query.oauth_verifier;
// //   var T = new Twit({
// //     consumer_key:         'RqmeYeipJjDqwZ1nia0NB9oel', //get this from developer.twitter.com where your app info is
// //     consumer_secret:      'aEG4aqpBVsZiscmjluLPrEBGRplvjBNk4xoTsf5NWFRDxPTUlK', //get this from developer.twitter.com where your app info is
// //     access_token,
// //     access_token_secret,
// //     timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
// //     strictSSL:            true,     // optional - requires SSL certificates to be valid.
// //   })

// //   //
// //   //  tweet 'hello world!'
// //   //
// //   T.post('statuses/update', { status: 'hello world!' }, function(err, 
// //   data, response) {
// //     console.log(data)
// //   })
    
// });
const { TwitterApi }=require('twitter-api-v2');

const client = new TwitterApi({
    clientId: 'cnRtUXlndWdES0RlQmxaWUQtaC06MTpjaQ',
    clientSecret: 'LhBS1CfzRfi-bed2XQt5VcBDH4b_NbpVZ31xg7Q8ZuXppXs3hX',
    // accessToken: '1713443930044551168-K6cBOrEYLbGYsHnCDRKqSfEWgKSXXa',
    // accessSecret: 'clKOdFLYjfHrb2Wm68FsfF0NskkwQAy1fW1tEqhVnn2NK',
  });
  const CALLBACK_URL = 'http://127.0.0.1:3000/auth/twitter/callback'

router.get('/twitter', (req, res) => {
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, { scope: ['tweet.read','tweet.write', 'users.read', 'offline.access'] });
// Redirect your user to {url}, store {state} and {codeVerifier} into a DB/Redis/memory after user redirection
res.json({
    url,
    codeVerifier,
    state,
})


});
router.get('/twitter/callback',async (req,res) => {
    const { state, code } = req.query;
    console.log("🚀 ~ file: facebookRouter.js:95 ~ router.get ~ req.query:", req.query)
  // Get the saved codeVerifier from session

  const   codeVerifier = "NBJcUp_M39DaC9zZkzkEez3OQH4fQRAeN1AxcxKMx-MmC4BvX~VlH6iTy5pPVTj-HTjb.qA~rHigEgrDc0RJnkY6tKSQOAP1aNk-Vur-O5TIyu6KKKTR518iTp1XGUj-" //TODO: data save in data and get from it
  const sessionState = "Bc1jmxQBX~kF0.uhoDj.ZBKIlk1Ef4KJ"  //TODO: data save in data and get from it  


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
    
});
router.get('/',(req,res)=>{
    res.send('fb ok');
});

module.exports = router;


