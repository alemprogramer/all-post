const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./passport')
const session = require('express-session');
const authentication = require('../middleware/authMiddleware')
//store



const middleware = [
    express.json(),
    express.urlencoded({extended: false}),
    express.static('public'),
    morgan('dev'),
    cors({
        credentials: true,
        origin: [
            'https://devfirmltd.com/',
            'https://api.devfirmltd.com',
            'http://localhost:3001',
            'https://post-all-frontend.vercel.app'
        ]}),
    cookieParser(),
    session({ 
        secret: 'your-secret-key',
        resave: true,
        saveUninitialized: true,
    }),
    passport.initialize(),
    passport.session(),
    authentication,
    
    
]

module.exports = (app)=>{
    middleware.forEach(middleware=>app.use(middleware))
}
