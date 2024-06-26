const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  createRefreshToken,
  createAccessToken,
} = require("../utils/tokenCreate");
const { validateEmail } = require("../utils/emailValidator");

const {setToken} = require("../utils/cookieSet");

exports.userSignupController = async (req, res, next) => {
    const {email} = req.body;
  try {
    if (!validateEmail(email))
      return res.status(400).json({ message: "Invalid emails." });

    const user = await User.findOne({ email});
    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    req.body.name = email.split("@")[0] ;

    req.body.password = await bcrypt.hash(req.body.password, 11);

    await User.create(req.body);

    res.status(200).json({
      success: 200,
      message: "User successfully signed up",
    });
  } catch (error) {
    next(error);
  }
};

exports.userLoginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email});

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const checkPassword =await  bcrypt.compare(password,user.password)

    if(!checkPassword){
        return res.status(400).json({
            message: "Invalid Credentials,pass",
          });
    }

    const refresh_token = createRefreshToken({id: user._id}, process.env.REFRESH_TOKEN_SECRET,'30d')
   
    const access_token = createAccessToken({id: user.id}, process.env.ACCESS_TOKEN_SECRET,'50m');

    setToken(refresh_token, access_token,res);

    res.json({message:'user login successfully ',refresh_token,access_token});
    
  } catch (error) {
    next(error);
  }
};

exports.refreshTokenController = async (req, res, next) => {
  let {refreshtoken} = req.body;
  try {
    const data = await jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET);
    let user = await User.findById(data.id);

    const refresh_token = createRefreshToken({id: user._id}, process.env.REFRESH_TOKEN_SECRET,'30d')
   
    const access_token = createAccessToken({id: user.id}, process.env.ACCESS_TOKEN_SECRET,'50m');

    setToken(refresh_token, access_token,res);

    res.json({message:'your token  refresh successfully ',refresh_token,access_token});
  } catch (error) {
    next(error);
  }
};

exports.logOutController = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
