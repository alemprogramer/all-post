require('dotenv').config();
const express = require('express');
// const passport = require('passport');
// const FacebookStrategy = require('passport-facebook').Strategy;
const passport = require('./middleware/passport')

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

app.use('/auth',fbRouter)


app.get('/', (req, res) => {
    res.send('ok');
});

const PORT = process.env.PORT || 3000;

// https.createServer(options, app).listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
})
