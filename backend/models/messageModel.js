const mongoose = require("mongoose");

// sender for id of that particular sender (user)
// content is the text user sending,
// chat the reference to the chat to which it belongs to 
const messageModel = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageModel);
module.exports = Message;