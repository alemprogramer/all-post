const fbLongLiveAccess = require('../utils/token');
const { SuperfaceClient } = require('@superfaceai/one-sdk');

const User = require('../model/User');
const FaceBook = require('../model/Facebook');
const {
    createRefreshToken,
    createAccessToken,
} = require("../utils/tokenCreate");
const axios = require('axios');
const Facebook = require('../model/Facebook');
const { fileUploadOnFacebookPAge, instagramImageUrlForPost } = require('../utils/facebookFileUpload');

const sdk = new SuperfaceClient();

exports.fbLongLiveAccessTokenController = async (req, res, next) => {
    try {
        const token = await fbLongLiveAccess('EABImtNdQ8q4BOyXl78V6Y41YkO3AoMK11ZA5zZAA875ZC4D3NDzLvikT7vbNJViKQop47QJMZAyrEPJrYkouykjKyBC5Cn4BSqBbBP6hOBu1gXJyGydZArmVZBKy4JE2hutz0P0gwiU9ZAmTQqcoZAMNQrnozJCmg6bEEE927dZCtxGaGIUyqbVhaNOOpwYAwEFF3GoGP6KsldgKq0kMRNtL1PMbOKFdpKS32eZANCfn1rpZC7U5YVQJ9geOCC0QbKPPkZBemQZDZD')
        res.send(token)
    } catch (error) {
        next(error);
    }
}

exports.fbLoginCallBackController = async function (req, res, next) {

    try {

        // get token form facebook
        const tokenResponse = await axios.get(
            `https://graph.facebook.com/v22.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}&code=${req.query.code}`
        );
        // const accessToken = await fbLongLiveAccess(tokenResponse.data.access_token);
        const accessToken = tokenResponse.data.access_token;

        const userData = await axios.get(`https://graph.facebook.com/v22.0/me?fields=email,name,picture&access_token=${accessToken}`);
        const { email, name, picture, id } = userData.data
        // console.log("🚀 ~ userData:", email, name, picture,id)
        console.log('all ok');

        const facebookPageList = await axios.get(`${process.env.FACEBOOK_API_URL}/me/accounts?fields=instagram_business_account{name},picture,name,category,access_token&access_token=${accessToken}`)


        //new code 
        const pageList = facebookPageList.data.data;

        //page list formatter
        const listOfPage = []
        for (let i = 0; i < pageList.length; i++) {
            if (pageList[i].instagram_business_account) {
                const { id, name } = pageList[i].instagram_business_account
                const { profile_picture_url } = await axios.get(`${process.env.FACEBOOK_API_URL}/${id}?fields=profile_picture_url&access_token=${accessToken}`)

                let obj = {
                    id: pageList[i].id,
                    pageName: pageList[i].name,
                    profilePic: pageList[i].picture.data.url,
                    pageCategory: pageList[i].category,
                    accessToken: pageList[i].access_token,
                    instagram: {
                        instagramName: name || "",
                        profilePic: profile_picture_url || "",
                        id,
                        accessToken: accessToken,
                        permission: true,
                    }
                }
                listOfPage.push(obj)

            } else {
                let obj = {
                    id: pageList[i].id,
                    pageName: pageList[i].name,
                    profilePic: pageList[i].picture.data.url,
                    pageCategory: pageList[i].category,
                    accessToken: pageList[i].access_token,
                }
                listOfPage.push(obj)
            }
        }

        const currentDate = new Date();
        const ExpireDate = new Date(currentDate.getTime() + (1000 * 60 * 60 * 24 * 90)); //60 days
        const isUser = await Facebook.findOne({ id })
        let userIdForToken = '';
        if (isUser) {
            console.log('update');
            
            const { userId, _id } = isUser;
            const update = {
                $set: {
                    pages: listOfPage,
                    accessTokenExpire: ExpireDate,
                }
            };
            await Facebook.findOneAndUpdate({ _id: _id }, update);
            userIdForToken = userId

        } else {
            console.log('new login');

            const facebook = new FaceBook({
                id: id,
                name: name,
                accessToken: accessToken,
                // profilePic: photos.value,
                pages: listOfPage || [],
                groups: [],
                accessTokenExpire: ExpireDate
            })

            const fbUser = await facebook.save();

            let user = await User.findOne({ email });
            if (!user) {
                 user = new User({
                    email,
                    name,
                    linkedin: {},
                    facebook: [fbUser._id]
                })

                 user = await user.save();
            }



            const facebookData = await Facebook.findById(fbUser._id);
            facebookData.userId = user._id;
            await facebookData.save();
            userIdForToken = user._id;
        }
        const refresh_token = createRefreshToken({ id: userIdForToken }, process.env.REFRESH_TOKEN_SECRET, '30d')
        const access_token = createAccessToken({ id: userIdForToken }, process.env.ACCESS_TOKEN_SECRET, '50m');

        //social media cookies
        res.redirect(`${process.env.LOGIN_REDIRECT_URL}?access_token=${access_token}&refresh_token=${refresh_token}&facebook_AccessToken=${accessToken}; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 90)}`)

    } catch (err) {
        console.log(err);
        next(err);
    }
}

exports.facebookGroupDataCollectController = async (req, res, next) => {
    try {
        console.log('id:', req.id);
        // const user = await User.findById(req.id).populate('facebook')
        const facebook = await Facebook.findOne({ userId: req.id })
        let allGroups = []
        let url = `${process.env.FACEBOOK_API_URL}/me/groups?fields=administrator,name,picture{url}&limit=100&access_token=${facebook.accessToken}`;
        while (url) {
            let response = await axios.get(url);
            let groups = response.data
            for (let i = 0; i < groups.data.length; i++) {
                if (groups.data[i].administrator) {
                    allGroups.push(groups.data[i])
                }
            }
            if (groups.paging.next) {
                url = groups.paging.next
            } else {
                url = ""
            }
        }

        let finalGroup = [];
        for (let i = 0; i < allGroups.length; i++) {
            let obj = {
                groupName: allGroups[i].name,
                profilePic: allGroups[i].picture.data.url,
                id: allGroups[i].id,
                administrator: allGroups[i].administrator,
            }
            finalGroup.push(obj)
        }

        facebook.groups = finalGroup
        await facebook.save();

        res.status(200).json({
            status: 200,
            message: 'Facebook Group data collected successfully',
            // user
            groups: finalGroup
        })
    } catch (error) {
        next(error);
    }
}

//TODO: message collect
exports.facebookPostController = async (req, res, next) => {
    //facebook will be true if any page or group id in the array
    let { facebook, facebookPageIds, facebookGroupsIds, instagramIds, text } = req.body;
    const { facebook: fb } = req.user;

    if (!(Array.isArray(facebookPageIds) && facebookPageIds.length > 0)) {
        facebookPageIds = [facebookPageIds];
    }

    if (!(Array.isArray(facebookGroupsIds) && facebookGroupsIds.length > 0)) {
        facebookGroupsIds = [facebookGroupsIds];
    }

    if (!(Array.isArray(instagramIds) && instagramIds.length > 0)) {
        instagramIds = [instagramIds];
    }

    // var postId ;

    try {
        //if facebook user not post in any fb platforms
        if ((facebook != 'true') || !fb.length) {
            console.log('fb is empty');
            //if user not selected any fb pages , groups and instagram accounts it will be go to next middleware
            return next();
        }


        let imageUrl;
        if (Array.isArray(facebookPageIds) && facebookPageIds[0]) {
            console.log('fb pages');

            //loop for multiple facebook accounts
            for (let i = 0; i < fb.length; i++) {
                //get user all pages data 
                //for new token for page post
                const facebookPageList = await axios.get(`${process.env.FACEBOOK_API_URL}/me/accounts?fields=name,id,access_token&access_token=${fb[i].accessToken}`)
                const facebookData = facebookPageList.data.data;

                //check token is valid or not
                if (!facebookData.length) {
                    return res.status(400).json({
                        status: '400',
                        message: 'please login facebook  again'
                    })
                }

                //post on user selected pages
                const message = [];
                for (let i = 0; i < facebookData.length; i++) {
                    //check witch pages are selected for page (by page id machine)
                    if (facebookPageIds.includes(facebookData[i].id)) {
                        let url = `${process.env.FACEBOOK_API_URL}/${facebookData[i].id}/feed?message=${text}&access_token=${facebookData[i].access_token}`
                        if (req.files.length) {
                            let data = await fileUploadOnFacebookPAge(facebookData[i].id, facebookData[i].access_token, req)
                            if (Array.isArray(instagramIds) && instagramIds.length) {
                                imageUrl = await instagramImageUrlForPost(data.data.post_id, facebookData[i].access_token)
                            }

                        } else {
                            await axios.post(url)
                        }
                    }
                }
            }
        }

        //TODO: message collect
        if (Array.isArray(facebookGroupsIds) && facebookGroupsIds[0]) {
            console.log('fb groups: ');
            //loop for multiple facebook accounts
            for (let i = 0; i < fb.length; i++) {
                //loop for post on selected facebook groups
                for (let j = 0; j < facebookGroupsIds.length; j++) {

                    if (req.files.length) {
                        //image and test with post
                        let data = await fileUploadOnFacebookPAge(facebookGroupsIds[j], fb[i].accessToken, req)

                        if (Array.isArray(instagramIds) && instagramIds.length) {
                            imageUrl = await instagramImageUrlForPost(data.data.post_id, fb[i].accessToken)
                        }
                    } else {
                        //without any image post
                        let url = `${process.env.FACEBOOK_API_URL}/${facebookGroupsIds[j]}/feed?message=${text}&access_token=${fb[i].accessToken}`
                        let response = await axios.post(url);
                    }
                }

            }

        }
        if (Array.isArray(instagramIds) && instagramIds.length && req.files.length && false) { //TODO: add URL Shortener then is using
            console.log('instagram', imageUrl);
            console.log('text', text);
            //loop for multiple facebook accounts
            for (let i = 0; i < fb.length; i++) {
                //loop for post on selected instagram account connected to facebook page
                for (let j = 0; j < instagramIds.length; j++) {
                    console.log(`access_token=${fb[i].accessToken}`);
                    console.log(instagramIds[j]);
                    //single image  upload API 
                    // let url =`${process.env.FACEBOOK_API_URL}/${instagramIds[j]}/media?message=${text}&image_url=${imageUrl}&access_token=${fb[i].accessToken}`
                    let response = await axios.post(`${process.env.FACEBOOK_API_URL}/${instagramIds[j]}/media?caption=test post!&image_url=${'https://media.macphun.com/img/uploads/customer/how-to/608/15542038745ca344e267fb80.28757312.jpg?q=85&w=1340'}&access_token=${fb[i].accessToken}`);
                    //publish content by this API requests
                    let media_publish_Url = `${process.env.FACEBOOK_API_URL}/${instagramIds[j]}/media_publish?creation_id=${response.data.id}&access_token=${fb[i].accessToken}`

                    await axios.post(media_publish_Url);
                }
            }
        }
        next();
    } catch (error) {
        next(error.message);
    }
}

