export const getSender = (loggedUser, users) => {
  // users will gave only two user, 1 is logged in user 2 is the user to whom we are chatting , one on one conversation this is
  return users[0]?._id === loggedUser?._id ? users[1]?.name : users[0]?.name;
};

export const getSenderFull = (loggedUser, users) => {
  // its returning one user object, then we are passing this user into ProfileModel
  return users[0]?._id === loggedUser?._id ? users[1] : users[0];

}

export const isLastMessage = (messages, i, userId) => {
  // i === messages.length - 1 is last messages or no
  // messages[messages.length-1].sender._id !== userId -> Is last message sent by sender or by user (last message should not belong to loggedin user)
  // checking last message's sender's id 
return (
  i === messages.length - 1 &&
  messages[messages.length - 1].sender._id !== userId &&
  messages[messages.length - 1].sender._id 
)
}

export const isSameSender = (messages,m, i, userId) => {
  // i < messages.length - 1 if its a lst message or no
  // messages[i+1].sender._id !== msg.sender._id checks if next message is send by same sender or no , if next message's sender id === current msg sender id then its same sender 
  // messages[i].sender_id !== userId  current message's senderid should not equal to user id so that we can show pic 
  // messages[i+1] -> next message
return (
  i < messages.length - 1 &&
  (messages[i + 1].sender._id !== m.sender._id ||
  messages[i + 1].sender._id === undefined) && 
  messages[i].sender._id !== userId 
)
}

export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);
  // messages[i + 1].sender._id === m.sender._id next message should belong by same person, next message id === current message id
  // messages[i].sender._id !== userId current msg should not belong to loggedin user


  // it will be marginLeft 33px if its not the last message, so it wont have avatar, that's why it will by 33px left, 33px will be empty space for avatar, avatar will be shown only as the last message of other person, so to make them align same, we give 33px marginleft it the message sent by other person and its not the last message
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id && // current message is sent by other person
    messages[i].sender._id !== userId
  )
    return 33; // 33px
  else if (
    // left side 
    // before || , if current message is sent by loggedin user
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId) // last message of other person, that means it will have an avatar that's y marginleft 0, as avatar will take 33px 
  )
    return 0; // if message if from logged in user
    // rigth side
  else return "auto";
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};
