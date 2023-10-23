const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;


//facebook strategy
passport.use(new FacebookStrategy({
  clientID: `5109107729167022`,
  clientSecret: `dc4dc755d731a7bfd189b4fd54b9176e`,
  callbackURL: 'http://localhost:3000/api/v1/facebook/callback', // Your callback URL
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
  clientID:'86ushza2suvs3a',
  clientSecret:'i2EN5Vq8AKlPcb7h',
  callbackURL: 'http://localhost:3000/auth/linkedin/callback',
  scope: [
    'profile', 'email', 'openid', 'w_member_social'],
  // state:true
}, function (accessToken, refreshToken, profile, done) {
  console.log("🚀 ~ file: passport.js:48 ~ refreshToken:", refreshToken)
  console.log("🚀 ~ file: passport.js:48 ~ accessToken:", accessToken)
  console.log("🚀 ~ file: passport.js:50 ~ profile:", profile)

  return done(null, profile);
}
));





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