const router = require('express').Router();

const {facebookPostController} = require('../controller/facebookController')

router.post('/all',facebookPostController,(req,res) => {
    res.status(200).json({
        status: 200,
        msg:"post successful"
    })
})

module.exports = router