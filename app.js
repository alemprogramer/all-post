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
const axios = require('axios')
const fbRouter = require('./router/facebookRouter')

var options = {
    key: fs.readFileSync('certificate/key.pem'),
    cert: fs.readFileSync('certificate/cert.pem')
  };

// Configure sessions
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'))

app.use('/fb',fbRouter)


// https://graph.facebook.com/v18.0
// Configure Facebook strategy
passport.use(new FacebookStrategy({
    clientID: `5109107729167022`,
    clientSecret: `dc4dc755d731a7bfd189b4fd54b9176e`,
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
    return done(null, 'profile');
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

app.get('/token',async (req, res, next) => {
    const data = {
        client_id: "2658453617636886",
        client_secret:'2128d58b1ab44eb0c10dc2c507e79da3',
        redirect_uri:'https://localhost:3000/auth/instagram/callback',
        grant_type:'authorization_code',
        code: 'AQCisgybN16f-QRoA8TtRP3s8uq5exFelI4wrUXiJcue0KhqoILjSr1GxsrDclzOW6M5j50KM44ddZR2eUHqDt2WYsn805Qgzn3kqoYatxPZH-mfzig8hFm1yNiL6J8G7H0LKo5TwCG_X3kYuKBa8UacIraeRm7WvYdgz_k9HgzXHocEp-bOKAo7SaiTStVraUCRd55MlAXK1tYIkvcRcBPTKW7X97NVjn5ihiegUlc5lw'
    }
// Define the API URL
const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
 
    const apiUrl = await axios.post(`https://api.instagram.com/oauth/access_token`,data,{ headers });

// Make the HTTPS request
    res.json(apiUrl.data)
})

app.get('/login',(req, res) =>{
    res.redirect('https://api.instagram.com/oauth/authorize/?client_id=2658453617636886&redirect_uri=https://localhost:3000/auth/instagram/callback&response_type=code&scope=user_profile,user_media&client_secret=2128d58b1ab44eb0c10dc2c507e79da3')
})

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
const PORT = process.env.PORT || 3000;

https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// app.listen(PORT, () => {
//     console.log(`server listening on port ${PORT}`);
// })
