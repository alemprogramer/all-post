const router = require('express').Router();

const {facebookPostController} = require('../controller/facebookController');

const uploader = require('../middleware/uploader')

router.post('/all',uploader.array('photos', 100),facebookPostController,(req,res) => {
    // console.log('image',req.files);
    res.status(200).json({
        status: 200,
        msg:"post successful"
    })
})

module.exports = router