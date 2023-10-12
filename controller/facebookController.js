const fbLongLiveAccess = require('../utils/token');
const { SuperfaceClient } = require('@superfaceai/one-sdk');
const axios = require('axios');

const sdk = new SuperfaceClient();

exports.fbLongLiveAccessTokenController = async (req,res,next)=>{
    try {
        const token =await fbLongLiveAccess('EABImtNdQ8q4BO7rEbAzM2tjNnqN1LcWCZBke8jqoZBZCLtyn5iKN6zKsDOV0qQEay2gg3NMs96UZAxmv7itHfjgykZCEEUb4EaVTozZC1hZBZCfu9i2tfL4iIs8b7mrwQjCRZBGYLPPQW0e9UlhkTwDUQZAdHqqqdgfXvixhGnY5fZAeTJW8zZCLfxmowzAAT2JJv8ZAEP1S8q0HJ')
        res.send(token)
    } catch (error) {
        next(error);
    }
}

exports.fbLoginCallBackController = async function (req, res, next) {
    console.log('data',req.query);
    try {
      // <8> Obtaining profiles
        const accessToken = req.user.accessToken;
        const sdkProfile = await sdk.getProfile(
            'social-media/publishing-profiles@1.0.1'
        );
        const result = await sdkProfile
            .getUseCase('GetProfilesForPublishing')
            .perform(
            {},
            {
                provider: 'instagram',
                parameters: {
                accessToken,
                },
            }
            );
        const facebookPageList = await axios.get(`${process.env.FACEBOOK_API_URL}/me/accounts?access_token=${accessToken}`)
        const profiles = result.unwrap();
        console.log("🚀 ~ file: facebookController.js:37 ~ facebookPageList:", facebookPageList.data)
        req.user.profile.pageList = facebookPageList.data

        res.json({
            facebook:req.user.profile,
            instagram:profiles,
            accessToken:req.user.accessToken,
            // facebookPageList
        })
    } catch (err) {
      next(err);
    }
  }