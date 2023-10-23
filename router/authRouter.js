const router = require('express').Router();

const {userSignupController,userLoginController,refreshTokenController,logOutController} = require('../controller/authController');

router.post('/signup', userSignupController);
router.post('/login', userLoginController);
router.get('/refreshToken', refreshTokenController);
router.get('/logout', logOutController);


module.exports = router;