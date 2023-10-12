const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;




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