const {Schema,model} = require('mongoose');

const facebookSchema = new Schema({
        id:String,
        userId:{
          type:Schema.Types.ObjectId,
          ref:'User',
        },
        fbEmail:String,
        accessToken:String,
        name:String,
        profilePic:String,
        pages:[{
            pageName:String,
            profilePic:String,
            id:String,
            pageCategory:String,
            accessToken:String,
            instagram:{
              permission:Boolean,
              instagramName:String,
              profilePic:String,
              id:String,
              accessToken:String,
            }
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
});


module.exports = model('Facebook', facebookSchema);