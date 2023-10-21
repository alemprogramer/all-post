const router = require('express').Router();

const {postInLinkedInController} = require('../controller/linkedinController');


router.get('/post',postInLinkedInController)



module.exports = router;
