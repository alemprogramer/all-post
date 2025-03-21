const { Schema, model } = require("mongoose");
const Facebook = require("./Facebook");

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
    },
    password: String,

    //twitter
    twitter:{
      twitterEmail:String,
      name:String,
      twitterAccessToken: String,
      id:String,
      twitterRefreshToken: String,
      accessTokenExpire: Number,
      twitterProfile: String,
    },
    linkedin: [
      {
        type:Schema.Types.ObjectId,
        ref: 'Linkedin',
      }
    ],
    facebook: [
      {
        type: Schema.Types.ObjectId,
        ref: Facebook,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
