const router = require('express').Router();
const passport = require('../middleware/passport')


const { fbLongLiveAccessTokenController,fbLoginCallBackController } = require('../controller/facebookController');

router.get('/fb-refresh-token', fbLongLiveAccessTokenController);
router.get('/facebook',passport.authenticate('facebook'));
router.get('/facebook/callback', passport.authenticate('facebook'),fbLoginCallBackController);
router.get('/',(req,res)=>{
    res.send('fb ok');
});

module.exports = router;


