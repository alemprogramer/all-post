const router = require('express').Router();
const passport = require('../middleware/passport')



const { fbLongLiveAccessTokenController,fbLoginCallBackController,facebookPostController } = require('../controller/facebookController');

const {twitterLoginController,twitterLoginCallbackController,twitterTokenRefreshController} = require('../controller/twitterController');


router.get('/fb-refresh-token', fbLongLiveAccessTokenController);
router.get('/login',passport.authenticate('facebook'));
router.get('/callback', passport.authenticate('facebook'),fbLoginCallBackController);
router.get('/post',facebookPostController);




router.get('/twitter', twitterLoginController);
router.get('/twitter/callback',twitterLoginCallbackController);
router.get('/twitter/refreshToken',twitterTokenRefreshController);

router.get('/',(req,res)=>{
    res.send('fb ok');
});

module.exports = router;





