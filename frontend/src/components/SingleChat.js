import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  Text,
  IconButton,
  useToast,
  Spinner,
  FormControl,
  Input,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModel from "./miscellaneous/ProfileModel";
import UpdateGroupChatModel from "./miscellaneous/UpdateGroupChatModel";
import axios from "axios";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:5000"
let socket, selectedChatCompare

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);
        // console.log(data)
      socket.emit("join chat", selectedChat._id)

    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  useEffect(() => {
    socket = io(ENDPOINT)
    socket.emit("setup", user)
    socket.on("connected", () => setSocketConnected(true))
    socket.on("typing", () => setIsTyping(true))
    socket.on("stop typing", () => setIsTyping(false))
    
  }, [])
  useEffect(() => {
    // whenever we changes selectedChat (changing from userA to userB, dustin to connor like wise) we want to fetch all messages again
    fetchMessages();
    selectedChatCompare = selectedChat
  }, [selectedChat]);
  // console.log(notification, "--------------------")
  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      // console.log("message recieved", newMessageRecieved)
      if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
        // give notif
        // if new message recieved in not there in the notifications array 
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification])
          setFetchAgain(!fetchAgain)
        }
      } else {
        setMessages([...messages, newMessageRecieved])
        // console.log(messages)
      }
    })
  })
  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id)
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        // console.log(data)
        // appending this data to the array of all of the messages 9:00 #14
        // console.log(data)
        socket.emit("new message", data)
        setMessages([...messages, data]);
        // added by me
        setFetchAgain(!fetchAgain)
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
  //  using send button
  const sendMessage2 = async (e) => {
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id)
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );
        // console.log(data)
        // appending this data to the array of all of the messages 9:00 #14
        // socket.emit("new message", data)
        socket.emit("new message", data)
        setMessages([...messages, data]);
        // added by me
        setFetchAgain(!fetchAgain)
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };




  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true)
      socket.emit("typing", selectedChat._id)
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
    
  };
  // console.log(messages);
  return (
    <div>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            // w={{ md: "64vw", base: "100vw" }}
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                {/* we have to pass a user into ProfileModel, there are two users in users array of selectedChat as it is one on one
                getSenderFull in returning one user obj */}
                <ProfileModel user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModel
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w={{ md: "66vw", base: "96vw" }}
            h="81vh"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="message">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <FormControl
              display="flex"
              isRequired
              mt={3}
              onKeyDown={sendMessage}
            >
              <div>
              {isTyping ? <div><i>typing...</i></div> : <></>}
              </div>
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message...."
                onChange={typingHandler}
                value={newMessage}
              />
              <Button colorScheme="teal" ml={2} onClick={sendMessage2}>
                send
              </Button>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </div>
  );
};

export default SingleChat;