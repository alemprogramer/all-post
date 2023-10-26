const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "please enter a valid email"],
      trim: true,
      unique: true,
    },
    password: String,

    //twitter
    twitterCodeVerifier:String,
    twitterSessionState:String,
    twitterAccessToken:String,
    twitterRefreshToken:String,

    //linkedin
    linkedEmail: String,
    linkedin:{
        email:String,
        name:String,
        proPic:String,
        accessToken:String,
        expiresInAccessToken:Number,
        refreshToken:String,
        expiresInRefreshToken:Number,
        userId:String
    }
    

    


  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
