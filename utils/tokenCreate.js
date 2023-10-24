const jwt = require('jsonwebtoken');

exports.createAccessToken = (payload,token,time) => {
    return jwt.sign(payload, token, {expiresIn: time || '50m' })
}

exports.createRefreshToken = (payload,refreshToken,time) => {
    console.log(time);
    return jwt.sign(payload, refreshToken, {expiresIn:time || '30d'})
} 

