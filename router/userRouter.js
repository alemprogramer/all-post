const router = require('express').Router();

const {getSingleUserData} = require('../controller/userController')

router.get('/', getSingleUserData);
module.exports = router