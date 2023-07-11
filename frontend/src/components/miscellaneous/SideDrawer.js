import { Button } from "@chakra-ui/button";
import React, { useState } from "react";
import axios from "axios";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/avatar";
import { BellIcon, ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/tooltip";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModel from "./ProfileModel";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/hooks";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import NotificationBadge, { Effect } from 'react-notification-badge'

const SideDrawer = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user, setSelectedChat, chats, setChats, notification, setNotification} = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setSelectedChat(null)
    navigate("/");
  };
  const handleSearch = async () => {
    if (!search) {
      setLoading(false)
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const {data}  = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true)
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config)
      // console.log(data)
      // data will be an object 
      //see chats.find, chats.find2 ss, audio
      // chats.find((c) => c._id === data._id it is checking if we ever talked with that particular user or no chats = [{chatmodel1(user1)}, {chatmodel2(user2),so on]
      if (!chats.find((c) => c._id === data._id)) {
        // chats.find((c) => c._id === data._id if we never talked with that user, then it will be false and !false is true
        setChats([data, ...chats])
        // this is adding a new conversation with a user into Chats array 
      }
    
      setSelectedChat(data)
      setLoadingChat(false)
      onClose();
    } catch (error) {
      toast({
        title: "Error Fetching the chat",
        description: error.message,
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontWeight={800} fontFamily="Work sans">
          BlueLight
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
            <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize={"2xl"} m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => {
                // console.log(getSender(user, notif.chat.users))
                console.log(notif)
                return (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${notif.sender.name}`}
                  </MenuItem>
                )
              } )}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModel>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create your account</DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch} colorScheme="blue">find</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                  // accessChat={() => accessChat(user._id)}
                />
              ))
            )}
          </DrawerBody>
          {loadingChat && <Spinner ml="auto" display="flex"/>}
          {/* <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">Save</Button>
          </DrawerFooter> */}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
