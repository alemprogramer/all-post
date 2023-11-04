const router = require('express').Router();

router.post('/post',(req,res) => {
    res.send('ok');
})

module.exports = router