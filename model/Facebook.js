const {Schema,model} = require('mongoose');

const facebookSchema = new Schema({
        id:String,
        fbEmail:String,
        accessToken:String,
        name:String,
        profilePic:String,
        pages:[{
            permission:{
              type:Boolean,
              default:true,
            },
            pageName:String,
            profilePic:String,
            id:String,
            pageCategory:String,
            accessToken:String,
          }],
        groups:[{
            permission:{
              type:Boolean,
              default:true
            },
            groupName:String,
            profilePic:String,
            id:String,
            groupCategory:String,
            accessToken:String,
        }],
        instagram:[{
          permission:{
              type:Boolean,
              default:true
          },
          instagramName:String,
          profilePic:String,
          id:String,
          accessToken:String,
        }]
});


module.exports = model('Facebook', facebookSchema);