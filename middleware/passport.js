const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;
// const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook');

// const User = require('../models/User'); 
// const bcrypt = require('bcrypt');

// passport.use(new LocalStrategy((username, password, done) => {
//   console.log(username, password);
//   User.findOne({ username: username }, async function (err, user) {

//     if (err) { return done(err); }
//     if (!user) { return done(null, false); }
//     password = await bcrypt.compare(password, user.password);
//     console.log(password);
//     if (!password) { return done(null, false); }
//     let loginUser = {};
//     loginUser.username = user.username;
//     loginUser.id = user._id;

//     return done(null, user);
//   });
// }
// ));

//google strategy
// passport.use(new GoogleStrategy({
//   clientID: `370649854396-i1392e3s6q6j9ck90pb8svu7ncnvkamb.apps.googleusercontent.com`,
//   clientSecret: `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`,
//   callbackURL: `http://localhost:3000/oauth2/redirect/google`,
//   scope: ['profile'],
//   state: true
// },
//   function (accessToken, refreshToken, profile, done) {
//     console.log('here');
//     User.findOne({ googleId: profile.id }, function (err, user) {
//       if (err) {
//         return done(err);
//       }
//       if (user) {
//         return done(null, user);
//       } else {
//         var newUser = new User({
//           username: profile.displayName,
//           googleId: profile.id
//         });

//         newUser.save(function (err) {
//           if (err) {
//             throw err;
//           }
//           return done(null, newUser);
//         });
//       }
//     });
//   }
// ));

//app secretID : 87201d1d45609fd399dfb1e34cb90173
//app ID : 520241122718225

//facebook strategy
passport.use(new FacebookStrategy({
  clientID: `520241122718225`,
  clientSecret: `87201d1d45609fd399dfb1e34cb90173`,
  callbackURL: `http://localhost:3000/auth/facebook/callback`,
  profileFields: ['id', 'displayName', 'email'],
  state: true

},

  function (accessToken, refreshToken, profile, done) {
    console.log("🚀 ~ file: passport.js:74 ~ refreshToken:", refreshToken)
    console.log("🚀 ~ file: passport.js:74 ~ accessToken:", accessToken)
    console.log('here');
    
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
  if (user) {
    return done(null, user);
  }
  return done(null, false);
})
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    if (err) return done(err, false);
    return done(null, user);

  })
})

module.exports = passport;