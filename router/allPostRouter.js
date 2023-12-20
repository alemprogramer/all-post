const router = require('express').Router();

const {facebookPostController} = require('../controller/facebookController');
const {postInLinkedInController} = require('../controller/linkedinController');
const {twitterTweetPostController} = require('../controller/twitterController');

const uploader = require('../middleware/uploader')

router.post('/all',uploader.array('photos', 100),facebookPostController,postInLinkedInController,twitterTweetPostController,(req,res) => {
    // console.log('image',req.files);
    res.status(200).json({
        status: 200,
        msg:"post successful"
    })
})

module.exports = router