const router = require('express').Router();
const passport = require('../middleware/passport')

const { fbLongLiveAccessTokenController,fbLoginCallBackController,facebookPostController,facebookGroupDataCollectController } = require('../controller/facebookController');
console.log('here');

router.get('/groups',facebookGroupDataCollectController)
router.get('/fb-refresh-token', fbLongLiveAccessTokenController);
router.get('/login',passport.authenticate('facebook'));
router.get('/callback',fbLoginCallBackController);
router.get('/post',facebookPostController);



module.exports = router;





