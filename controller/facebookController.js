const fbLongLiveAccess = require('../utils/token')
exports.fbLongLiveAccessTokenController = async (req,res,next)=>{
    try {
        const token =await fbLongLiveAccess('EABImtNdQ8q4BOZBWxMZC09tcjNp6DZCLVVxDILgrZB1GAEYg0HpmUhT34a3CugZCaL8fs9cpFdTM8BBT1txQLO636Wo5mxdFQ8CZAy4U91CAxvVvAke52YeZAGVX2ipN5nyV2fPqrz23oNGiFNe2Qpb4zTzOlv2eka7MCpZBOfqZAs4IdVAv24GKcTbiiQaZCNiotSBfgNYUs64zG7rkLUNltgdbrZCgyLviBt2cNfGgktZB9d7PGBV0t7Fq7yjafO2cbw0YQ3Q8PDn9Jp8ZD')
        res.send(token)
    } catch (error) {
        next(error);
    }
}