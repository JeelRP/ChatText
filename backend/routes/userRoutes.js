const express = require("express");
const { registerUser, authUser, allUsers } = require("../controllers/userControllers");
const router = express.Router();
const {protect} = require("../middleware/authMiddleware")

// api/user/login .... api/user is from app.use in server.js
// "/" and "/login" dono same he kam krte hai bas syntax do alag alag tarike rehete vo bataya hai 

router.route('/').post( registerUser)
router.post("/login", authUser);
router.get('/', protect, allUsers);
module.exports = router;