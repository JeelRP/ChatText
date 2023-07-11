
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");
// audio recording
//  protect will return a user, we are putting that in req object, req.user , if we get the user then he is authorized or is not
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
    // it checking if there is something in the headers.authorization or no, and if there is something, its checking it its starting from Bearer or no
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
  // bearer xcvzxcvxczvxcz = ["bearer", "xcvxcvxcvz"] we are taking index 1
      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
// if its get verified then we will get the payload we sent while jwt.sign(paylaod(id), secretkey)
            // decoded variable will be an object like { id: "sdfsdfsdf" }
      
       // req = {user: } we are creating a key called user in req object so that we can do req.user to get that particular user data
      req.user = await User.findById(decoded.id).select("-password");
      
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };