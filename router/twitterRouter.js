const router = require('express').Router();

const {twitterLoginController,twitterLoginCallbackController,twitterTokenRefreshController,twitterTweetPostController} = require('../controller/twitterController')

router.get('/login', twitterLoginController);
router.get('/callback',twitterLoginCallbackController);
router.get('/refreshToken',twitterTokenRefreshController);
router.get('/tweet-post',twitterTweetPostController);


module.exports = router;