import React, {  createContext, useContext, useEffect, useState } from 'react'
import {useNavigate} from "react-router-dom"

const ChatContext = createContext()
const ChatProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState()
  const [selectedChat, setSelectedChat] = useState() // object of one on one chat accessChat api , it means chatModel of one particular chat, which will container two users(inside chatModel's users: array) for one on one and a 2 or more users for groupChat
  const [chats, setChats] = useState() // array of all chatModels, it will be a array that will contain objects (chatModel) to how many users , the logged in user chatted with => fetchChat api
  // chat = [{a}, {b}, {v},....]
  const [notification, setNotification] = useState([])
  
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"))
    setUser(userInfo)
    if (!userInfo) {
      navigate("/")
    }
  }, [navigate])
  return (
    <ChatContext.Provider value={{user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification}}>
      {children}
    </ChatContext.Provider>
  )
}
export const ChatState = ()=>{
  return useContext(ChatContext)
}

export default ChatProvider 