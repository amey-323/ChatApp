const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessagesUser,
  deleteMessagesAll,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId/:userId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.post("/deleteMessages/:userId", protect, deleteMessagesUser);
router.post("/deleteMessages", protect, deleteMessagesAll);

module.exports = router;
