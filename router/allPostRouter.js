const router = require('express').Router();

//api response for json:
`{
    "facebook":false,
    "facebookPageIds":[
        "108969681964158",
        "868669880008773"
    ],
    "facebookGroupsIds":[
        "356736066769871"
    ],
    "instagramIds":[
        "17841462256382769"
    ],
    "text":" post by ",
    "media":["https://media.macphun.com/img/uploads/customer/how-to/608/15542038745ca344e267fb80.28757312.jpg?q=85&w=1340"],
    "linkedin":true,
    "twitter":true,
    "options": ["red", "green", "black', "blue",],
}`
//for linkedin and twitter file uploader needed and from data

// {
//     facebook = true,
//     facebookPageIds = 108969681964158
//     facebookPageIds = 868669880008773
//     .
//     .
//     facebookGroupsIds =356736066769871
//     facebookGroupsIds =356736066769871
//     .
//     .
//     instagramIds =17841462256382769
//     instagramIds =17841462256382769
//     .
//     .
//     text =  what's on your mind.
//     media = image url
//     media = image url
//     linkedin = true
//     twitter = true
//     options = red
//     options = green
//     options = black

// }

const {facebookPostController} = require('../controller/facebookController');
const {postInLinkedInController} = require('../controller/linkedinController');
const {twitterTweetPostController} = require('../controller/twitterController');
const { allSocialStatusController } = require('../controller/socialController');

const {postValidator} = require('../validator/postValidator');

const uploader = require('../middleware/uploader')

router.post('/all',uploader.array('photos', 100),postValidator,facebookPostController,postInLinkedInController,twitterTweetPostController,(req,res) => {
    // console.log('image',req.files);
    res.status(200).json({
        status: 200,
        msg:"post successful"
    })
})

router.get('/socials',allSocialStatusController)
module.exports = router