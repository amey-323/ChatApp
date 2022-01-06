const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  const { user } = req;

  try {
    const messages = await Message.find({
      chat: req.params.chatId,
      deletedBy: { $elemMatch: { $ne: user._id } },
    })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
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

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Delete an array of messages by Id
//@route           DELETE /api/Message/
//@access          Protected
const deleteMessages = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { messageIds } = req.body;

  if (messageIds.length === 0) {
    console.log("Please pass at least one message id");
    return res.sendStatus(400);
  }

  try {
    var { deletedCount } = await Message.deleteMany({
      _id: { $in: messageIds },
    });
    if (deletedCount === messageIds.length) {
      return res.status(200).send("Messages Deleted Successfully");
    }
    res.status(404);
    throw new Error("Failed to delete some messages!");
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage, deleteMessages };
