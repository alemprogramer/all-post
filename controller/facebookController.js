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
const Facebook = require('../model/Facebook');


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
        const facebookPageList = await axios.get(`${process.env.FACEBOOK_API_URL}/me/accounts?fields=instagram_business_account{name},picture,name,category,access_token&access_token=${accessToken}`)
        const instagram = result.unwrap().profiles;

        //new code 
        const pageList = facebookPageList.data.data;
        const {id,displayName,photos} = req.user.profile
        
        //page list formatter
        const listOfPage = []
        for(let i = 0; i<pageList.length ; i++) {
            if(pageList[i].instagram_business_account) {
                let data ;
                for(let j = 0; j < instagram.length; j++) {
                    if(instagram[j].id == pageList[i].instagram_business_account.id){
                        data = instagram[j];
                        break;
                    }
                }
                let obj = {
                    id:pageList[i].id,
                    pageName: pageList[i].name,
                    profilePic:pageList[i].picture.data.url,
                    pageCategory:pageList[i].category,
                    accessToken:pageList[i].access_token,
                    instagram:{
                        instagramName:data?.name || "",
                        profilePic:data?.imageUrl,
                        id:data.id,
                        accessToken:accessToken,
                        permission:true,
                    }
                }
                listOfPage.push(obj)
                
            }else{
                let obj = {
                    id:pageList[i].id,
                    pageName: pageList[i].name,
                    profilePic:pageList[i].picture.data.url,
                    pageCategory:pageList[i].category,
                    accessToken:pageList[i].access_token,
                }
                listOfPage.push(obj)
            }
                
        }


        // //group list formatter
        // // TODO: api call and save data


        const isUser = await Facebook.findOne({id})
        let userIdForToken = '' ;
        if (isUser) {
            const {userId,_id} = isUser ;
            const update = {
                $set: {
                    pages: listOfPage
                }
            };
            await Facebook.findOneAndUpdate({ _id:_id },update);
            userIdForToken=userId
          
        } else {
            console.log('login');

            const facebook = new FaceBook({
                id:id,
                name:displayName,
                accessToken: accessToken,
                profilePic: photos.value,
                pages: listOfPage || [],
                groups:[]
            })

            const fbUser = await facebook.save();

            const user = new User({
                name:displayName,
                linkedin:{},
                facebook:[fbUser._id]
            })
           
            let newUser = await user.save();

            const facebookData = await Facebook.findById(fbUser._id);
            facebookData.userId = newUser._id;
            await facebookData.save();
            userIdForToken = newUser._id;
        }
        const refresh_token = createRefreshToken({id: userIdForToken}, process.env.REFRESH_TOKEN_SECRET,'30d')
        const access_token = createAccessToken({id: userIdForToken}, process.env.ACCESS_TOKEN_SECRET,'50m');

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
    } catch (err) {
      next(err);
    }
  }

exports.facebookGroupDataCollectController = async (req, res, next) => {
    try {
        console.log('id:', req.id);
        // const user = await User.findById(req.id).populate('facebook')
        const facebook = await Facebook.findOne({userId: req.id})
        let allGroups = []
        let url = `${process.env.FACEBOOK_API_URL}/me/groups?fields=administrator,name,picture{url}&limit=100&access_token=${facebook.accessToken}`;
        while(url){
            let response = await axios.get(url);
            let groups = response.data
            for(let i = 0; i < groups.data.length; i++) {
                if(groups.data[i].administrator){
                    allGroups.push(groups.data[i])
                }
            }
            if(groups.paging.next){
                url = groups.paging.next
            }else {
                url=""
            }
        }

        let finalGroup = [];
        for(let i = 0; i < allGroups.length; i++) {
            let obj = {
                groupName:allGroups[i].name,
                profilePic:allGroups[i].picture.data.url,
                id:allGroups[i].id,
                administrator:allGroups[i].administrator,
            }
            finalGroup.push(obj)
        }

        facebook.groups = finalGroup
        await facebook.save();

        res.status(200).json({
            status:200,
            message: 'Facebook Group data collected successfully',
            // user
            groups:finalGroup
        })
    } catch (error) {
        next(error);
    }
}

exports.facebookPostController = async (req, res,next) => {
    const {facebook,facebookPageIds,text,images} =req.body;
    console.log("🚀 ~ file: facebookController.js:208 ~ exports.facebookPostController= ~ text:", text)
    const { facebook: fb } = req.user
    try {
        if(!facebook || !fb.length) {
            console.log('fb is empty');
            return  next();
        }
        console.log('fb contains');

        //set image url 
        let imageUrl='';
        for(let i = 0; i < images.length; i++) {
            imageUrl = imageUrl+'&url='+images[i].image
        }
        console.log("🚀 ~ file: facebookController.js:217 ~ exports.facebookPostController= ~ imageUrl:", imageUrl)


        for(let i = 0; i < fb.length; i++) {
            //facebook page post
            const facebookPageList = await axios.get(`${process.env.FACEBOOK_API_URL}/me/accounts?fields=name,id,access_token&access_token=${fb[i].accessToken}`)
            const facebookData = facebookPageList.data.data;
            console.log("🚀 ~ file: facebookController.js:224 ~ exports.facebookPostController= ~ facebookData:", facebookData.length)
            //check token is valid or not
            if(!facebookData.length){
                return res.status(400).json({
                    status:'400',
                    message: 'please login facebook  again'
                })
            }

            //collect page token
            const message = [];
            for(let i=0; i < facebookData.length; i++){
                if(facebookPageIds.includes(facebookData[i].id)){
                    // console.log('text',text);
                    // console.log('facebookData[i].id',facebookData[i].id);
                    // console.log('facebookData[i].access_token',facebookData[i].access_token);
                    // let url = `${process.env.FACEBOOK_API_URL}/${facebookData[i].id}/feed?message=${text}&access_token=${facebookData[i].access_token}`
                    let url = `${process.env.FACEBOOK_API_URL}/${facebookData[i].id}/photos?url=${images[0]}&message=${text}&access_token=${facebookData[i].access_token}&published=true`
                    
                    // console.log("🚀 ~ file: facebookController.js:245 ~ exports.facebookPostController= ~ url:", url)
                    let response = await axios.post(url)
                    // console.log("🚀 ~ file: facebookController.js:244 ~ exports.facebookPostController= ~ res:", response.data)

                    // message.push(res.data)
                }
            }
            console.log("🚀 ~ file: facebookController.js:234 ~ exports.facebookPostController= ~ message:", message)
            next();

        }

        
        
    } catch (error) {
        next(error.message);
    }
}