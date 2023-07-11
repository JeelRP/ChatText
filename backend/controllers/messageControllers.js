const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

// this will be messageModel object
const sendMessage = asyncHandler(async (req, res) => {
    // their are chatmodel's id for every chat one on one or groupChat, this is that chatId 
    // every chat model is basically is a user (usera, userb)
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic"); // it will populate sender : {userModel} with name and pic fields
    message = await message.populate("chat"); // it will populate  chat : with  {chatModel} of that particular chatId only ids and insider chatModel's users there will be only ids , because we are not further populating it , like we did it in chatController's fetchChats
    // now we further want users (from user model) inside messageModel's chatModel's users: field
    // message = await User.populate(message, {
    //   path: "chat.users",
    //   select: "name pic email",
    // });
    // find the particular chat(chatModel) using chatId and update(append) latestMessage
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
// array of objects
const allMessages = asyncHandler(async (req, res) => {
    // we are getting all messages of that particular chat id(particular user) which we are getting in params
    try {
      // chat will be mongoose.Schema.Types.ObjectId, see message model type
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
      res.json(messages)
    } catch (error) {
        res.status(400);
        throw new Error(error.message)
  }
});
module.exports = { sendMessage, allMessages };
