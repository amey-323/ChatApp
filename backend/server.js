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
const path = require("path");
// const users = {};

// const socketToRoom = {};

//**************** For groupCall-New****************/

connections = {};
messages = {};
timeOnline = {};

//---end---

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

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//------------------deployment---------------------
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running");
  });
}
//------------------deployment---------------------

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

  //********for groupCall*********

  // socket.on("join room", (roomID) => {
  //   if (users[roomID]) {
  //     const length = users[roomID].length;
  //     if (length === 6) {
  //       socket.emit("room full");
  //       return;
  //     }
  //     users[roomID].push(socket.id);
  //   } else {
  //     users[roomID] = [socket.id];
  //   }
  //   socketToRoom[socket.id] = roomID;
  //   const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

  //   socket.emit("all users", usersInThisRoom);
  // });

  // socket.on("sending signal", (payload) => {
  //   io.to(payload.userToSignal).emit("user joined", {
  //     signal: payload.signal,
  //     callerID: payload.callerID,
  //   });
  // });

  // socket.on("returning signal", (payload) => {
  //   io.to(payload.callerID).emit("receiving returned signal", {
  //     signal: payload.signal,
  //     id: socket.id,
  //   });
  // });

  // socket.on("disconnect", () => {
  //   const roomID = socketToRoom[socket.id];
  //   let room = users[roomID];
  //   if (room) {
  //     room = room.filter((id) => id !== socket.id);
  //     users[roomID] = room;
  //   }
  //   socket.broadcast.emit("user left", socket.id);
  // });

  //**************For groupCall- New***********/

  socket.on("join-call", (roomID) => {
    if (connections[roomID] === undefined) {
      connections[roomID] = [];
    }
    connections[roomID].push(socket.id);

    timeOnline[socket.id] = new Date();

    for (let a = 0; a < connections[roomID].length; ++a) {
      io.to(connections[roomID][a]).emit(
        "user-joined",
        socket.id,
        connections[roomID]
      );
    }

    if (messages[roomID] !== undefined) {
      for (let a = 0; a < messages[roomID].length; ++a) {
        io.to(socket.id).emit(
          "chat-message",
          messages[roomID][a]["data"],
          messages[roomID][a]["sender"],
          messages[roomID][a]["socket-id-sender"]
        );
      }
    }

    console.log(roomID, connections[roomID]);
  });

  socket.on("signal", (toId, message) => {
    io.to(toId).emit("signal", socket.id, message);
  });

  socket.on("chat-message", (data, sender) => {
    data = sanitizeString(data);
    sender = sanitizeString(sender);

    var key;
    var ok = false;
    for (const [k, v] of Object.entries(connections)) {
      for (let a = 0; a < v.length; ++a) {
        if (v[a] === socket.id) {
          key = k;
          ok = true;
        }
      }
    }

    if (ok === true) {
      if (messages[key] === undefined) {
        messages[key] = [];
      }
      messages[key].push({
        sender: sender,
        data: data,
        "socket-id-sender": socket.id,
      });
      console.log("message", key, ":", sender, data);

      for (let a = 0; a < connections[key].length; ++a) {
        io.to(connections[key][a]).emit(
          "chat-message",
          data,
          sender,
          socket.id
        );
      }
    }
  });

  socket.on("disconnect", () => {
    var diffTime = Math.abs(timeOnline[socket.id] - new Date());
    var key;
    for (const [k, v] of JSON.parse(
      JSON.stringify(Object.entries(connections))
    )) {
      for (let a = 0; a < v.length; ++a) {
        if (v[a] === socket.id) {
          key = k;

          for (let a = 0; a < connections[key].length; ++a) {
            io.to(connections[key][a]).emit("user-left", socket.id);
          }

          var index = connections[key].indexOf(socket.id);
          connections[key].splice(index, 1);

          console.log(key, socket.id, Math.ceil(diffTime / 1000));

          if (connections[key].length === 0) {
            delete connections[key];
          }
        }
      }
    }
  });
});
