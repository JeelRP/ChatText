const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const userRoutes = require("./routes/userRoutes.js")
const chatRoutes = require("./routes/chatRoutes.js")
const messageRoutes = require("./routes/messageRoutes.js")
const {notFound, errorHandler} = require("../backend/middleware/errorMiddleware.js")
dotenv.config();
connectDB(); // i made a function there then called that function here
// require("./config/db.js") // i did it without creating a function , so we have to require the file path
app.use(express.json())
app.get("/", (req, res) => {
  res.send("api is running");
});

// instead of doing app.use(router) 
// its like app.use("prefix path", router) addition of prefix path and here i used userRoutes name instead of router, because i will be having messageRoutes, chatRoutes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// if above paths(/api/user) will not be there then it will come to this line 
// upper k path k alawa koi bhalta hi path hoga to vo sidhe upper k lines chod k ye 21st line pe aaega or error show hoga
app.use(notFound)
app.use(errorHandler)
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
})

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000"
  }
})

io.on("connection", (socket) => {
  console.log("connected to socket.io")

  socket.on("setup", (userData) => {
    socket.join(userData._id)
    // console.log(userData._id)
    socket.emit("connected")
  })
  socket.on("join chat", (room) => {
    socket.join(room)
    // console.log(`User join room: ${room}`)
  })
  socket.on("typing", (room)=> socket.in(room).emit("typing"))
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))
  
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    
    if (!chat.users) return console.log("chat.users is not defined")
    
    
    chat.users.forEach(user => {
      
      if (user === newMessageRecieved.sender._id) return;
      console.log(`Sending message to user ${user}`);
      socket.to(user).emit("message recieved", newMessageRecieved)
    })
    // chat.users.forEach(user => {
    //   if (user._id !== newMessageRecieved.sender._id) {
    //     console.log(`Sending message to user ${user._id}`);
    //     socket.to(user._id).emit("message recieved", newMessageRecieved);
    //   }
    // });
    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  })
})