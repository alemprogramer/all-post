const router = require('express').Router();
const passport = require('../middleware/passport')


const { fbLongLiveAccessTokenController,fbLoginCallBackController,facebookPostController } = require('../controller/facebookController');

router.get('/fb-refresh-token', fbLongLiveAccessTokenController);
router.get('/facebook',passport.authenticate('facebook'));
router.get('/facebook/callback', passport.authenticate('facebook'),fbLoginCallBackController);
router.get('/facebook/post',facebookPostController)

router.get('/linkedin', passport.authenticate('linkedin', {
    scope: ['r_emailaddress', 'r_liteprofile'],
  }));
  
  router.get('/linkedin/callback',
    passport.authenticate('linkedin'),(req,res) => {
        console.log('ok');
        res.send('ok');
    });


router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter'),(req,res) => {
    res.send('ok');
});
router.get('/',(req,res)=>{
    res.send('fb ok');
});

module.exports = router;


