const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

// for accessing all chats of a logged in User with one particuler(selected user from frontend, userId is id of that selected user) User, one on one chats

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }
  // if isChat is already present then it (will find in database)this  if statement will work, or else will work
// isChat will be a array of objects (chatModels) of one on one user , but we are doing res.send(isChat[0]) so it will send only 0th object
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
  .populate("users", "-password") // it will populate according to that particular userId
  .populate("latestMessage");
  
  // The .populate("users", "-password") method will populate the users field in the Chat model with the corresponding user documents from the User model. corresponding user document because we gave ref = User in users field in chatModel
  // it will populate users array, with the ref document , users array of chatModel ref is user, so it will populate it with user document with those id and also without selecting the password
  // it will populate latestMessage with messageModel : {sender: , content: , chat: }
  // then we want user model inside sender 
  // after that we want a user model inside latestmessage.sender  so we furthur populate latestMessage.sender with user Model fields
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
 // we want to populate latestMessage.sender with user document
  // latestMessage.sender will be populated with corresponding user document

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
     // if we havent ever chat with the user then it will create new chatModel {object}inside isChat array
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData)
      // console.log(createdChat) using chat gpt it will create sample example, it will an object (chatModel);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
       // fullChat will be a object (chatModel)
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});
// it is fetching all chats of a user, how many people he talked with
const fetchChats = asyncHandler(async (req, res) => {
  try {
    //   it is comparing the req.user._id with the ids present in the users array field of the Chat model. req.user = logged in user
    var fetchedChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    // further appending user model inside latestmessage.sender 
    fetchedChats = await User.populate(fetchedChats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(fetchedChats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    // we are sending users and group name from frontend
    return res.status(400).send({ message: "Please Fill all the Fields" });
  }
  // we are sending stringified body so we are converting into obj again by using parse
  var users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
  users.push(req.user); // all of the users we sent in body + the currently logged in
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password") // populate users with those users ids we are getting from frontend
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("users", "-password") // already having users in that chatId (chatModel)
    .populate("groupAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.json(updatedChat);
  }
});
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!added) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.json(added);
  }
});
const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const remove = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!remove) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.json(remove);
    }
  });
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
    addToGroup,
    removeFromGroup
};
