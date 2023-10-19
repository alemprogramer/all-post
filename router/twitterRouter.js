const router = require('express').Router();
const passport = require('../middleware/passport')

const {twitterTweetPostController} = require('../controller/twitterController')

router.get('/tweet-post',twitterTweetPostController)
router.get('/',(req,res)=>{
    res.send('twitter ok');
});

module.exports = router;