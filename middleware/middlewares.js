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
    cors(),
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
