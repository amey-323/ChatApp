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
      //deletedBy: { $elemMatch: { $ne: user._id } },
    })
      .populate("sender", "name pic email date time")
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
      select: "name pic email date time",
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
  // console.log(req.body);
  const { messageIds, userId } = req.body;

  if (!messageIds || !messageIds.length || messageIds.length === 0) {
    res.status(400);
    throw new Error("At least one message is required");
  }

  if (!userId) {
    res.status(400);
    throw new Error("User Id is required");
  }

  try {
    var { deletedCount } = await Message.deleteMany({
      $and: [{ _id: { $in: messageIds } }, { sender: userId }],
    });
    console.log(deletedCount, messageIds.length);
    if (deletedCount === messageIds.length) {
      return res.status(200).send("Messages Deleted Successfully");
    }
    res.status(401);
    throw new Error("Unauthorized: You don't have access to messages");
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error(error.message);
  }
});

const deleteMessagesUser = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { messageIds, chat, userId } = req.body;

  if (!messageIds || !messageIds.length || messageIds.length === 0) {
    res.status(400);
    throw new Error("At least one message is required");
  }

  if (!userId) {
    res.status(400);
    throw new Error("User Id is required");
  }

  if (!chat) {
    res.status(400);
    throw new Error("Chat is required");
  }

  if (!chat.users) {
    res.status(400);
    throw new Error("Chat doesn't contain users");
  }

  // console.log(chat.users);
  // console.log(userId);

  const foundUser = chat.users.find((u) => u._id == userId);

  if (!foundUser) {
    res.status(401);
    throw new Error("Unauthorized: You are not a member of the chat");
  }

  try {
    var messages = await Message.updateMany(
      { _id: { $in: messageIds } },
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
