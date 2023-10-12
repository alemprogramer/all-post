const axios = require('axios')
const fbLongLiveAccess =async  (token)=>{
    console.log(token);
    return new Promise(async(resolve, reject) =>{
        try {
            const access_token = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=5109107729167022&client_secret=dc4dc755d731a7bfd189b4fd54b9176e&fb_exchange_token=${token}`)
            resolve(access_token.data)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = fbLongLiveAccess