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
try {
  if (excludedRoutes.includes(req.path.toLowerCase())) {
    // Skip the global middleware for the excluded routes
    return next();
  }

  const token = req.header("Authorization");
  console.log('token:',token || "unauthorized");
  if (!token) return res.status(400).json({
    status: 400,
    msg: "Invalid Authentication.",
  });
  const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  let user = await User.findById(data.id).populate('facebook');

  req.user = user;
  req.id = data.id;

  next();
} catch (error) {
  return res.status(400).json({
    status: 400,
    msg: "Invalid Authentication.",
  })
}
  
};
