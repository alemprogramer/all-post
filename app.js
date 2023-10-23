require('dotenv').config();
const express = require('express');


var https = require('https');
var fs = require('fs');
const app = express();

const middleware = require('./middleware/middlewres');
const fbRouter = require('./router/facebookRouter')

const router = require('./router/router')   

var options = {
    key: fs.readFileSync('certificate/key.pem'),
    cert: fs.readFileSync('certificate/cert.pem')
  };

middleware(app)
router(app)

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
