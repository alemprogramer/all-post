const User = require("../model/User");

exports.allSocialStatusController  = async (req, res, next) => {
    
    try {
        const user = await User.findById(req.id)
        .populate({
            path: 'facebook',
            select: '-pages.accessToken -pages._id -pages.pageCategory -pages.instagram.accessToken -groups._id'
        })
        .select('-twitter.twitterAccessToken -twitter.twitterRefreshToken -linkedin.accessToken -linkedin.email -linkedin.refreshToken  -linkedin.expiresInRefreshToken')
        if(!user) {
            return res.status(404).json({
                status: 400,
                message: "User not found",
            })
        }
        const expiresTokens ={
            facebook: false,
            linkedin: false,
            twitter: false,
        }

        const {facebook,linkedin, twitter} = user;
        const {pages,groups,accessTokenExpire} =facebook.length ? facebook[0]: facebook
        //fb token expire
        if(facebook && accessTokenExpire > Date.now()) {
            expiresTokens.facebook = true;
        }

        console.log("🚀 ~ file: socialController.js:32 ~ exports.allSocialStatusController= ~ linkedin.expiresInAccessToken > Date.now():", linkedin.expiresInAccessToken , Date.now())
        if(linkedin && linkedin.expiresInAccessToken > Date.now()){
            expiresTokens.linkedin = true;
        }
        if(twitter && twitter.accessTokenExpire > Date.now()) {
            expiresTokens.twitter = true
        }

        res.status(200).json({
            status: 200,
            expiresTokens: expiresTokens,
            facebook:{
                pages,groups
            },
            linkedin,
            twitter
            // user
        })

        
    } catch (error) {
        next(error);
    }
}