const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
//const { chats } = require("./data/data");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const session = require("express-session");
const app = express();
const Chat = require("./models/chatModel");

const users = {};

const socketToRoom = {};

dotenv.config();
// dotenv.config();
connectDB();
app.use(express.json());
app.use(
  session({
    cookie: {
      secure: true,
      maxAge: 86400,
      sameSite: "none",
    },
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000" || "http://localhost:3001",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    try {
      socket.join(userData._id);
      socket.emit("connected");
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (data) => {
    const room = data.chat;
    const { typer } = data;
    socket.in(room).emit("typing", typer);
  });

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("deleteMsg", async (data) => {
    const { chatId, from } = data;
    const chat = await Chat.findOne({ _id: chatId }).populate(
      "users",
      "-password"
    );
    // console.log(chat);
    if (!chat.users) return console.log("chat.users not defined");
    console.log(chat.users);
    console.log(from);
    chat.users.forEach((u) => {
      if (u._id == from) return;
      socket.in(u._id).emit("messages deleted", chatId);
    });
  });

  socket.on("callUser", (data) => {
    //Start from here
    const chat = data.userToCall;

    chat.users.forEach((user) => {
      // console.log(user._id, data.from);
      if (user._id == data.from) return;
      // console.log("Checking...", user._id);
      socket.in(user._id).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
      });
    });
  });

  socket.on("makingCall", (data) => {
    //Start from here
    const chat = data.to;

    chat.users.forEach((user) => {
      // console.log(user._id, data.from);
      if (user._id == data.from) return;
      socket.in(user._id).emit("makingCall", {
        from: data.from,
        name: data.name,
      });
    });
  });

  socket.on("acceptCall", (data) => {
    // console.log(data);
    const { by, name } = data;
    socket.in(data.of).emit("isCallAccepted", { by, name });
  });

  socket.on("rejectCall", (data) => {
    // console.log(data);
    const { by, name } = data;
    socket.in(data.of).emit("isCallRejected", { by, name });
  });

  socket.on("answerCall", (data) => {
    console.log(data);
    socket.in(data.to.from).emit("callAccepted", data.signal);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });

  //for groupCall

  socket.on("join room", (roomID) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 6) {
        socket.emit("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
    }
    socket.broadcast.emit("user left", socket.id);
  });
});
