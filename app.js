const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const app = express();
const port = 3000;

// Configure sessions
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

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

app.get('/', (req, res) => {
    // res.render('index');
    res.json('login')
});

// app.get('/profile', (req, res) => {
//     if (!req.isAuthenticated()) {
//         res.redirect('/');
//         return;
//     }
//     res.render('profile', { user: req.user });
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
