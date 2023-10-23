const router = require('express').Router();
const passport = require('../middleware/passport')

const {twitterLoginController,twitterLoginCallbackController,twitterTokenRefreshController,twitterTweetPostController} = require('../controller/twitterController')


router.get('/login', twitterLoginController);
router.get('/callback',twitterLoginCallbackController);
router.get('/refreshToken',twitterTokenRefreshController);
router.get('/tweet-post',twitterTweetPostController);

router.get('/',(req,res)=>{
    res.send('twitter ok');
});

module.exports = router;