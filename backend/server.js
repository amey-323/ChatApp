const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { chats } = require("./data/data");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const session = require("express-session");
const app = express();

dotenv.config({ path: "../.env" });
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

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
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

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
