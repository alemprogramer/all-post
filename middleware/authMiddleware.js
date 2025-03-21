const jwt = require("jsonwebtoken");
const User = require("../model/User");

module.exports = async (req, res, next) => {
  //this array characters must be lower case
  const excludedRoutes = [
    "/api/v1/auth/login",
    "/api/v1/auth/signup",
    "/api/v1/auth/refreshtoken",
    "/api/v1/facebook/login",
    "/api/v1/facebook/callback",
    "/api/v1/linkedin/login",
    "/api/v1/linkedin/callback",
    "/api/v1/twitter/login",
    "/api/v1/twitter/callback",
  ]; // Add routes you want to exclude here
  const forApiKeyUse = [
    `/api/v1/post/all`,
    `/api/v1/post/socials`
  ]
  try {
    if (excludedRoutes.includes(req.path.toLowerCase())) {
      // Skip the global middleware for the excluded routes
      return next();
    }

    const token = req.header("Authorization");
    let user ;

    //for customer key detect 
    if(req.query.apikey && !token && forApiKeyUse.includes(req.path.toLowerCase())){
      user = await User.findById(req.query.apikey).populate('facebook').select('-password');
      
        if (!user){
          return res.status(400).json({
            status: 400,
            msg: "Please give  your valid key",
          });
        } 
    }else{
      //for all authenticate user
      console.log('token:',token.length || "unauthorized");
      if (!token) return res.status(401).json({
        status: 401,
        msg: "Invalid Authentication.",
      });
      const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      user = await User.findById(data.id).populate('facebook');
    }

    req.user = user;
    req.id = user._id;
    return next();

  } catch (error) {
    if(req.query.apikey){
      return res.status(400).json({
        status: 400,
        msg: "Please give your valid key.",
      });
    }

    return res.status(401).json({
      status: 401,
      msg: "Invalid Authentication.",
    })
  }
  
};
