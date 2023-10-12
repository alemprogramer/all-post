const router = require('express').Router();


const { fbLongLiveAccessTokenController } = require('../controller/facebookController');

router.get('/fb-refresh-token', fbLongLiveAccessTokenController);
router.get('/',(req,res)=>{
    res.send('fb ok');
});

module.exports = router;


