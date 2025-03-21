const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;




//facebook strategy
passport.use(new FacebookStrategy({
  clientID: `5109107729167022`,
  clientSecret: `dc4dc755d731a7bfd189b4fd54b9176e`,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL, // Your callback URL
  profileFields: ['id', 'displayName', 'email','profileUrl','picture'],
  scope:['pages_show_list','pages_read_user_content','pages_show_list', 'instagram_basic', 'instagram_content_publish','public_profile','email'],
  state: true
},

//https://www.facebook.com/v13.0/dialog/oauth?client_id=5109107729167022&redirect_uri=https://devfirmltd.com/api/facebook/callback&scope=email,public_profile,pages_show_list,pages_read_user_content,instagram_basic,instagram_content_publish

async  function (accessToken, refreshToken, profile, done) {
    console.log("🚀 ~ file: passport.js:17 ~ profile:", profile)
    return done(null,{ profile, accessToken });
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