const { AuthClient, RestliClient, } = require('linkedin-api-client');

const axios = require('axios');
const User = require('../model/User');
const {
  createRefreshToken,
  createAccessToken,
} = require("../utils/tokenCreate");

const { setToken, cookieSet } = require('../utils/cookieSet');
const linkedinFileUploader = require('../utils/linkedinFileUploader');
const Linkedin = require('../model/Linkedin');


const params = {
  clientId: process.env.LINKEDIN_CLIENTID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUrl: process.env.LINKEDIN_CALLBACK_URL,
  enabled: true,
  logSuccessResponses: true,
}
const authClient = new AuthClient(params);
const restClient = new RestliClient();

exports.linkedinLoginController = async (req, res, next) => {
  let scopes = [
    'profile',
    'email',
    'openid',
    'w_member_social',
    'r_organization_social',
    'rw_organization_admin'
  ]
  const url = authClient.generateMemberAuthorizationUrl(scopes)
  res.redirect(url)
}

exports.linkedinCallbackUrlController = async (req, res, next) => {
  const { code } = req.query;
  try {
    const token = await authClient.exchangeAuthCodeForAccessToken(code)

    // user info
    const user = await restClient.get({ resourcePath: '/userinfo', accessToken: token.access_token })

    // console.log("🚀 ~ exports.linkedinCallbackUrlController= ~ user:", user.data)
    const userInfo = await User.findOne({
      $or: [
        { email: user.data.email },
      ]
    }).populate("linkedin", "id");

    // const response = await axios.get(
    //   "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token.access_token}`,
    //       "Content-Type": "application/json"
    //     }
    //   }
    // );

    // console.log("Raw Response:", response.data);



    // const response1 = await axios.get(
    //   `https://api.linkedin.com/v2/organizations/${105002298}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token.access_token}`,
    //       "Content-Type": "application/json"
    //     }
    //   }
    // );

    // console.log("Organization Details:", response1.data);


    const currentDate = new Date();
    const ExpireDate = new Date(currentDate.getTime() + (1000 * 60 * 60 * 24 * 90));
    console.log(userInfo.linkedin);


    if (userInfo && userInfo.linkedin.length > 0) {
      //if match linkedin id 
      if (userInfo.linkedin.some(item => item.id === user.data.sub)) {
        console.log('update in query');
        const updateQueryForLinkedin = {
          $set: {
            email: user.data.email,
            accessToken: token.access_token,
            name: user.data.name,
            profilePic: user.data.picture,
            expiresInAccessToken: ExpireDate,
            refreshToken: token.refresh_token,
            expiresInRefreshToken: token.refresh_token_expires_in,
          }
        }

        await Linkedin.findOneAndUpdate({ _id: userInfo._id }, updateQueryForLinkedin)
      } else {//if not match or new linkedin account 
        //insert new account  linkedin data to database
        const linkedin = new Linkedin({
          id: user.data.sub,
          email: user.data.email,
          accessToken: token.access_token,
          name: user.data.name,
          profilePic: user.data.picture,
          expiresInAccessToken: ExpireDate,
          refreshToken: token.refresh_token,
          expiresInRefreshToken: token.refresh_token_expires_in,
          userId: userInfo._id
          // organization: []
        })
        const newLinkedInUser = await linkedin.save()
        //update user model linkedin id add
        await User.findByIdAndUpdate(
          userInfo._id,
          { $addToSet: { linkedin: newLinkedInUser._id } }, // Prevents duplicate LinkedIn IDs
          { new: true, runValidators: true } // Returns updated document
        );
      }

      const refresh_token = createRefreshToken({ id: userInfo._id }, process.env.REFRESH_TOKEN_SECRET, '30d')
      const access_token = createAccessToken({ id: userInfo._id }, process.env.ACCESS_TOKEN_SECRET, '50m');

      res.redirect(`${process.env.LOGIN_REDIRECT_URL}?access_token=${access_token}&refresh_token=${refresh_token}&linkedin_access_token=${token.access_token}; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)}`)


    } else {
      console.log('new');

      //insert new account  linkedin data to database
      const linkedin = new Linkedin({
        id: user.data.sub,
        email: user.data.email,
        accessToken: token.access_token,
        name: user.data.name,
        profilePic: user.data.picture,
        expiresInAccessToken: ExpireDate,
        refreshToken: token.refresh_token,
        expiresInRefreshToken: token.refresh_token_expires_in,
        // organization: []
      })
      const newLinkedInUser = await linkedin.save()
      //user signup 
      let userId;
      if (userInfo) { //check user new or old
        userInfo.linkedin = [...userInfo.linkedin, newLinkedInUser._id];
        await userInfo.save();
        userId = userInfo._id
      } else {
        const userSignUp = new User({
          email: user.data.email,
          name: user.data.name,
          linkedin: [newLinkedInUser._id],
          facebook: [],
        })
        const newUser = await userSignUp.save();
        await Linkedin.findOneAndUpdate({ id: user.data.sub }, { userId: newUser._id });
        userId = newUser._id;
      }

      // login user
      const refresh_token = createRefreshToken({ id: userId }, process.env.REFRESH_TOKEN_SECRET, '30d')
      const access_token = createAccessToken({ id: userId }, process.env.ACCESS_TOKEN_SECRET, '50m');

      res.redirect(`${process.env.LOGIN_REDIRECT_URL}?access_token=${access_token}&refresh_token=${refresh_token}&linkedin_access_token=${token.access_token}; expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 60)}`)
    }


  } catch (error) {
    next(error)
  }


}


exports.postInLinkedInController = async (req, res, next) => {
  const { linkedin } = req.user;
  const { text, linkedin: ldIn } = req.body;
  try {
    if (ldIn != 'true' || !linkedin.userId) {
      console.log('inkedIn is empty');
      return next();
    }

    if (req.files.length) { // image or video post functionality
      console.log('image');
      await linkedinFileUploader(linkedin.accessToken, linkedin.userId, text, req.files[0].buffer);
    } else { // just text post functionality
      console.log('else');
      let payload = {
        resourcePath: '/ugcPosts',
        entity: {
          author: `urn:li:person:${linkedin.userId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text  // text post 
              },
              shareMediaCategory: 'NONE'
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        },
        accessToken: linkedin.accessToken
      }
      const ugcPostsCreateResponse = await restClient.create(payload);
    }

    next();
  } catch (error) {
    next(error)
  }

}

