const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

var mongoose = require("mongoose");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    var messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name pic email")
      .populate("chat");

    messages = messages.filter(
      (message) => !message.deletedBy.includes(req.params.userId)
    );

    // console.log(messages);
    // console.log(messages);
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
    time: new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "numeric",
      minute: "numeric",
    }),
    date: new Date().toLocaleDateString(),
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
const deleteMessagesAll = asyncHandler(async (req, res) => {
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

const deleteMessagesUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { messageIds } = req.body;
  const { userId } = req.params;
  console.log(req.params);

  if (messageIds.length === 0) {
    res.status(400);
    throw new Error("Please pass at least one message id");
  }

  if (!userId) {
    res.status(400);
    throw new Error("User Id is required in params");
  }

  try {
    var messages = await Message.updateMany(
      {
        $and: [{ _id: { $in: messageIds } }, { sender: userId }],
      },
      { $addToSet: { deletedBy: userId } }
    )
      .populate("sender", "name pic email")
      .populate("chat");
    console.log(messages);
    res.status(200).send("Messages deleted successfully");
  } catch (error) {
    res.status(500);
    console.log(error);
    throw new Error("Server Error");
  }
});

module.exports = {
  allMessages,
  sendMessage,
  deleteMessagesAll,
  deleteMessagesUser,
};
