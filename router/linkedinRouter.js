const router = require('express').Router();

const { linkedinLoginController, linkedinCallbackUrlController, postInLinkedInController} = require('../controller/linkedinController');


router.get('/login', linkedinLoginController);
router.get('/callback',linkedinCallbackUrlController);
router.get('/post',postInLinkedInController);


module.exports = router;
