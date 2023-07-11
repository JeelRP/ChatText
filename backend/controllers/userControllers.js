const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken")

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the fields");
  }
  const userExists = await User.findOne({ email: email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
    // it will stop further execution of code here due to throw new Error stops futher execution just like return 
  }

  const user = User({
    name,
    email,
    password,
    pic,
  });
    await user.save()
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
        pic: user.pic,
      token: generateToken(user._id)
    });
  } else {
      res.status(400);
      throw new Error("Failed to create new user")
  }
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            message: "User login succesfully",
            _id: user._id,
            name: user.name,
            email: user.email,
            password: user.password,
              pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(400);
        throw new Error("Invalid email or password")
    }
})

// api for searching all users
// api/user?search=anshul
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search ? {
    $or: [
      {name: {$regex: req.query.search, $options: "i"}},
      {email: {$regex: req.query.search, $options: "i"}},
    ]
  } : {}
  // {_id: {$ne: req.user._id}} give me all user but not the currently logged in user _id will return all the _id user but not us (the one is searching users or using this app currently, in other words currently logged in user) $ne = notEqual
  // req.user._id is comming from the protect middlware, protect middleware is having  req = {user: whole user obj} so we can access req.user._id, or anything
   const users = await User.find(keyword).find({_id: {$ne: req.user._id}})
  res.send(users)
})

module.exports = { registerUser, authUser, allUsers };