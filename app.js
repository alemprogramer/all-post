require('dotenv').config();
const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const InstagramStrategy = require('passport-instagram').Strategy;
const session = require('express-session');
const morgan = require('morgan')
var https = require('https');
var fs = require('fs');
const app = express();

// var options = {
//     key: fs.readFileSync('certificate/key.pem'),
//     cert: fs.readFileSync('certificate/cert.pem')
//   };

// Configure sessions
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'))


// https://graph.facebook.com/v18.0
// Configure Facebook strategy
passport.use(new FacebookStrategy({
    clientID: `520241122718225`,
    clientSecret: `87201d1d45609fd399dfb1e34cb90173`,
    callbackURL: 'http://localhost:3000/auth/facebook/callback', // Your callback URL
    profileFields: ['id', 'displayName', 'email'],
    scope:['pages_show_list','pages_read_user_content']
}, (accessToken, refreshToken, profile, done) => {
    console.log("🚀 ~ file: app.js:21 ~ profile:", profile)
    console.log("🚀 ~ file: app.js:20 ~ refreshToken:", refreshToken)
    console.log("🚀 ~ file: app.js:20 ~ accessToken:", accessToken)
    // You can save the user profile data to your database or use it as needed
    return done(null, profile);
}));

passport.use(new InstagramStrategy({
    clientID: `2658453617636886`,
    clientSecret: `2128d58b1ab44eb0c10dc2c507e79da3`,
    callbackURL: 'https://localhost:3000/auth/instagram/callback',
    // profileFields: ['id', 'name'],
    scope:['user_profile','user_media'],
    grant_type:'authorization_code'
    // response_type:"code"
}, (accessToken, refreshToken, profile, done) => {
    console.log("🚀 ~ file: app.js:34 ~ accessToken instagram:", accessToken)
    // Save the user profile data to your database or use it as needed
    return done(null, profile);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes for Facebook Login
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/'
}));




// Instagram login route
app.get('/auth/instagram', passport.authenticate('instagram'));

// Instagram callback route
app.get('/auth/instagram/callback', passport.authenticate('instagram', {
    successRedirect: '/', // Redirect to the profile page
    failureRedirect: '/' // Redirect to the home page on failure
}));

app.get('/', (req, res) => {
    // res.render('index');

    res.json({
        user:req.user
    })
});
// app.get('/profile', (req, res) => {
//     if (!req.isAuthenticated()) {
//         res.redirect('/');
//         return;
//     }
//     res.render('profile', { user: req.user });
// });

// https.createServer(options, app).listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
})
