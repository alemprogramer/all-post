const fbLongLiveAccess = require('../utils/token');
const { SuperfaceClient } = require('@superfaceai/one-sdk');
const Cookies = require('cookies')

const User = require('../model/User');
const FaceBook = require('../model/Facebook');
const {
    createRefreshToken,
    createAccessToken,
  } = require("../utils/tokenCreate");
const axios = require('axios');


const sdk = new SuperfaceClient();

exports.fbLongLiveAccessTokenController = async (req,res,next)=>{
    try {
        const token =await fbLongLiveAccess('EABImtNdQ8q4BOyXl78V6Y41YkO3AoMK11ZA5zZAA875ZC4D3NDzLvikT7vbNJViKQop47QJMZAyrEPJrYkouykjKyBC5Cn4BSqBbBP6hOBu1gXJyGydZArmVZBKy4JE2hutz0P0gwiU9ZAmTQqcoZAMNQrnozJCmg6bEEE927dZCtxGaGIUyqbVhaNOOpwYAwEFF3GoGP6KsldgKq0kMRNtL1PMbOKFdpKS32eZANCfn1rpZC7U5YVQJ9geOCC0QbKPPkZBemQZDZD')
        res.send(token)
    } catch (error) {
        next(error);
    }
}

exports.fbLoginCallBackController = async function (req, res, next) {
    const cookies = new Cookies(req, res);
    try {
      // <8> Obtaining profiles
    //   console.log('long live token',await fbLongLiveAccess(req.user.accessToken));
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
        const facebookPageList = await axios.get(`${process.env.FACEBOOK_API_URL}/me/accounts?fields=picture,name,category,access_token&access_token=${accessToken}`)
        const instagram = result.unwrap().profiles;

        //new code 
        // req.user.profile.pageList = facebookPageList.data;
        const pageList = facebookPageList.data.data;
        const {id,displayName,photos} = req.user.profile
        
        
       
        //page list formatter
        const listOfPage = []
        for(let i = 0; i<pageList.length ; i++) {
                let obj = {
                    id:pageList[i].id,
                    pageName: pageList[i].name,
                    profilePic:pageList[i].picture.data.url,
                    pageCategory:pageList[i].category,
                    accessToken:pageList[i].access_token
                }
                listOfPage.push(obj)
        }
        console.log("🚀 ~ file: facebookController.js:49 ~ listOfPage:", listOfPage.length)


        // //group list formatter
        // // TODO: api call and save data

        // //instagram list formatter
        const instagramList = [];
        for(let i = 0; i<instagram.length ; i++) {
            let obj = {
                id:instagram[i].id,
                pageName: instagram[i].name,
                profilePic:instagram[i].imageUrl || '',
                accessToken:accessToken
            }
            instagramList.push(obj)
        }

        console.log("🚀 ~ file: facebookController.js:67 ~ instagramList:", instagramList.length)

        if (false) {
            // const {pages} = isUser
          
        } else {
            console.log('login');

            const facebook = new FaceBook({
                        id:id,
                        name:displayName,
                        accessToken: accessToken,
                        profilePic: photos.value,
                        pages: listOfPage || [],
                        instagram: instagramList || [],
                        groups:[]
            })

            const fbUser = await facebook.save();
            console.log("🚀 ~ file: facebookController.js:101 ~ fbUser:", fbUser._id)

            const user = new User({
                name:displayName,
                linkedin:{},
                facebook:[fbUser._id]
            })
           
            let newUser = await user.save();
            const refresh_token = createRefreshToken({id: newUser._id}, process.env.REFRESH_TOKEN_SECRET,'30d')
            const access_token = createAccessToken({id: newUser._id}, process.env.ACCESS_TOKEN_SECRET,'50m');

            const expirationTime = new Date(Date.now() + 30 * 1000);
            //our own system cookies
            cookies.set('access_token', access_token,{ expires: new Date(Date.now() + 1000 * 60 *60 *24*30) }) //30days
            cookies.set('refresh_token', refresh_token,{ expires:  new Date(Date.now() + 1000 * 60 * 50)  }) //50 min
            
            //social media cookies
            cookies.set('facebook_AccessToken',accessToken,{ expires:  new Date(Date.now() + 1000 * 60 *60 *24*90)  }); //3 months

            res.status(201).json({
                status:200,
                message: 'User created successfully by facebook',
                refresh_token, 
                access_token,
                facebook_AccessToken:accessToken,
            })
    
        }
    } catch (err) {
      next(err);
    }
  }

  exports.facebookPostController = async (req, res,next) => {
    const accessToken = 'EABImtNdQ8q4BO7rEbAzM2tjNnqN1LcWCZBke8jqoZBZCLtyn5iKN6zKsDOV0qQEay2gg3NMs96UZAxmv7itHfjgykZCEEUb4EaVTozZC1hZBZCfu9i2tfL4iIs8b7mrwQjCRZBGYLPPQW0e9UlhkTwDUQZAdHqqqdgfXvixhGnY5fZAeTJW8zZCLfxmowzAAT2JJv8ZAEP1S8q0HJ';
    const message = 'Hello, Facebook! This is a test post.';

    // Define the API endpoint for posting to the user's feed
    const apiUrl = `https://graph.facebook.com/v12.0/me/feed`;

    // Create a data object with the post message
    const postData = {
    message,
    access_token: accessToken,
    };

    // Send a POST request to post to the user's feed
    const post = await axios.post(apiUrl, postData)
    console.log("🚀 ~ file: facebookController.js:66 ~ exports.facebookPostController= ~ post:", post)
   
    res.send('success')
  }