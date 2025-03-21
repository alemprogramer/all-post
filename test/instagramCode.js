const InstagramStrategy = require('passport-instagram').Strategy;
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