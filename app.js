require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');

//for https protocol
var https = require('https');
var fs = require('fs');


const middleware = require('./middleware/middlewares');
const router = require('./router/router')   

//for https protocol
var options = {
    key: fs.readFileSync('certificate/key.pem'),
    cert: fs.readFileSync('certificate/cert.pem')
};

//middleware invoke
middleware(app)

//router invoke
router(app)

// error handler 
app.use((req,res,next) => {
    let error = new Error('404 page not found');
    error.status = 404;
    next(error);
})

app.use((err, req, res, next) => {
    if(err.status === 404){
       return res.status(404).json({
            message: 'Data not Found'
       });
    }
    console.log(err);
    res.status(500).json({
        message: 'internal server error'
    });
})


// app.get('/test', (req, res) => {
//     console.log(req.user,req.id);
//     res.send('welcome to post all api v1');
// });

const PORT = process.env.PORT || 3000;

// https.createServer(options, app).listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

mongoose.connect(process.env.DATABASE_URL)
.then(() => {
    console.log('DB Connected to server');
    app.listen(PORT, () => {
        console.log(`server listening on port ${PORT}`);
    })
})


