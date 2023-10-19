const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
// const { Strategy } = require('@superfaceai/passport-twitter-oauth2');
// const TwitterStrategy = require( "passport-twitter-oauth2.0");





//facebook strategy
passport.use(new FacebookStrategy({
  clientID: `5109107729167022`,
  clientSecret: `dc4dc755d731a7bfd189b4fd54b9176e`,
  callbackURL: 'http://localhost:3000/auth/facebook/callback', // Your callback URL
  profileFields: ['id', 'displayName', 'email'],
  scope:['pages_show_list','pages_read_user_content','pages_show_list', 'instagram_basic', 'instagram_content_publish'],
  state: true
},

  function (accessToken, refreshToken, profile, done) {
    return done(null,{ profile, accessToken });
    
    // User.findOne({ facebookId: profile.id }, function (err, user) {
    //   if (err) {
    //     return done(err);
    //   }
    //   if (user) {
    //     return done(null, user);
    //   } else {
    //     var newUser = new User({
    //       username: profile.displayName,
    //       facebookId: profile.id
    //     });
    //     newUser.save(function (err) {
    //       if (err) {
    //         throw err;
    //       }
    //       return done(null, newUser);
    //     });
    //   }
    // });
  }
));

passport.use(new LinkedInStrategy({
  clientID: '86ribt9bfy52gk',
  clientSecret: 'a6Eyo1crcetlvqyo',
  callbackURL: 'http://localhost:3000/auth/linkedin/callback',
  scope: ['r_basicprofile', 'r_emailaddress'],
}, function (token, tokenSecret, profile, done) {
  console.log("🚀 ~ file: passport.js:50 ~ profile:", profile)
  console.log("🚀 ~ file: passport.js:50 ~ tokenSecret:", tokenSecret)
  console.log("🚀 ~ file: passport.js:50 ~ token:", token)
  return done(null, profile);
}
));

// passport.use(new LinkedInStrategy({
//   clientID: '86ribt9bfy52gk',
//   clientSecret: 'a6Eyo1crcetlvqyo',
//   callbackURL: 'http://localhost:3000/auth/linkedin/callback', // Adjust the callback URL
//   scope: ['r_emailaddress', 'r_liteprofile'],// Requested permissions
// },
// (token, tokenSecret, profile, done) => {
//   // You can save or handle the user profile information here
//   return done(null, profile);
// }
// ));


passport.use(new TwitterStrategy({
  consumerKey: 'RqmeYeipJjDqwZ1nia0NB9oel',
  consumerSecret: 'aEG4aqpBVsZiscmjluLPrEBGRplvjBNk4xoTsf5NWFRDxPTUlK',
  callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback', // Adjust the callback URL
},
(token, tokenSecret, profile, done) => {
  console.log("🚀 ~ file: passport.js:77 ~ tokenSecret:", tokenSecret)
  console.log("🚀 ~ file: passport.js:77 ~ token:", token)
  // console.log("🚀 ~ file: passport.js:77 ~ profile:", profile)
  


  const axios = require('axios')

const getAccessToken = async () => {
    try {
        const resp = await axios.post(
            'https://api.twitter.com/oauth2/token',
            '',
            {
                params: {
                    'grant_type': 'client_credentials'
                },
                auth: {
                    username:  token,
                    password:  tokenSecret
                }
            }
        );
        console.log(resp.data);
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
};

// getAccessToken();



  // var Twit = require('twit')

  // var T = new Twit({
  //   consumer_key:         'RqmeYeipJjDqwZ1nia0NB9oel', //get this from developer.twitter.com where your app info is
  //   consumer_secret:      'aEG4aqpBVsZiscmjluLPrEBGRplvjBNk4xoTsf5NWFRDxPTUlK', //get this from developer.twitter.com where your app info is
  //   access_token:         token,
  //   access_token_secret:  tokenSecret,
  //   timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  //   strictSSL:            true,     // optional - requires SSL certificates to be valid.
  // })

  // //
  // //  tweet 'hello world!'
  // //
  // T.post('statuses/update', { status: 'hello world!' }, function(err, 
  // data, response) {
  //   console.log(data)
  // })
  // You can save or handle the user profile information here
  return done(null, profile);
}
));


// passport.use(
//   // <2> Strategy initialization
//   new Strategy(
//     {
//       clientID: 'cnRtUXlndWdES0RlQmxaWUQtaC06MTpjaQ',
//       clientSecret: 'SLHX5EpDabyZKtNNGEbbIAwpOlUAthBRCVffEsRb7n9vuT_c-J',
//       clientType: 'confidential',
//       callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback',
//       // scope: [ 'offline.access']
//     },
//     // <3> Verify callback
//     (accessToken, refreshToken, profile, done) => {
//       console.log('Success!', { accessToken, refreshToken });
//       return done(null, 'profile');
//     }
//   )
// );


// passport.use(
//   new TwitterStrategy(
//       {
//         clientID: 'cnRtUXlndWdES0RlQmxaWUQtaC06MTpjaQ',
//         clientSecret: 'SLHX5EpDabyZKtNNGEbbIAwpOlUAthBRCVffEsRb7n9vuT_c-J',
//         callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback',
//           clientType: "public", // "public" or "private"
//           pkce: true, // required,
//           state: true, // required
//       },
//       function (accessToken, refreshToken, profile, done) {
//           console.log("🚀 ~ file: passport.js:167 ~ accessToken:", accessToken)
//           done(err, profile);
//       }
//   )
// );

passport.serializeUser((user, done) => {
  // if (user) {
  //   return done(null, user);
  // }
  // return done(null, false);
  done(null, user);
})
passport.deserializeUser((user, done) => {
  // User.findById(id, (err, user) => {
  //   if (err) return done(err, false);
  //   return done(null, user);

  // })
  done(null, user);
})

module.exports = passport;