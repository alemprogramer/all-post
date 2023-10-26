const jwt = require("jsonwebtoken");
const User = require("../model/User");

module.exports = async (req, res, next) => {
  const excludedRoutes = [
    "/api/v1/auth/login",
    "/api/v1/auth/signup",
    "/api/v1/facebook/login",
    "/api/v1/facebook/callback",
    "/api/v1/linkedin/login",
    "/api/v1/linkedin/callback",
    "/api/v1/twitter/login",
    "/api/v1/twitter/callback",
  ]; // Add routes you want to exclude here

  if (excludedRoutes.includes(req.path)) {
    // Skip the global middleware for the excluded routes
    return next();
  }

  const token = req.header("Authorization");
  console.log(token);
  if (!token) return res.status(400).json({ msg: "Invalid Authentication" });
  const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  let user = await User.findById(data.id);

  req.user = user;
  req.id = data.id;

  next();
};
