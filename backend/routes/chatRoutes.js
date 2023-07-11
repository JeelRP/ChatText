const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware")
const { accessChat, fetchChats, createGroupChat , renameGroup, addToGroup, removeFromGroup} = require("../controllers/chatControllers")

router.post("/", protect, accessChat)
router.get("/", protect, fetchChats)
router.post("/group", protect, createGroupChat)
router.put("/rename", protect, renameGroup)
router.put("/groupremove", protect, removeFromGroup)
router.put("/groupadd", protect, addToGroup)

module.exports =  router 