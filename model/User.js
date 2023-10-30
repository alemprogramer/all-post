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
    },
    
    

    //linkedin
    linkedEmail: String,
    linkedin: {
      email: String,
      name: String,
      proPic: String,
      accessToken: String,
      expiresInAccessToken: Number,
      refreshToken: String,
      expiresInRefreshToken: Number,
      userId: String,
    },
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
