import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(
  cors({
    origin: "*",
  })
);

let USERS = [];
let Count = 1;

io.on("connection", (socket) => {
  console.log("a user connected");

  const user = {
    id: socket.id,
    name: `User ${Count++}`,
  };
  USERS.push(user);

  io.emit("newUsers", USERS);
  socket.emit("me", user);

  socket.on("CALL:TO:USER", (data) => {
    // console.log("CALL TO USER ", data);
    let toUserData = USERS.find((user) => user.id === data.callToUserId);
    if (toUserData) {
      io.to(toUserData.id).emit("INCOMING:CALL", data);
    }
  });
  socket.on("REJECT:CALL", (data) => {
    io.to(data.to.id).emit("CALL:REJECTED", data);
  });

  socket.on("ACCEPT:CALL", (data) => {
    console.log("CALL ACCEPT ", data);

    // signal: data,
    // fromUser: currentUser,
    // to: inComingCallDetails.fromUser,

    io.to(data.to.id).emit("CALL:ACCEPT", data);
  });

  socket.on("END:CALL", (data) => {
    console.log("CALL END FROM", data);

    if (data.to) {
      io.to(data.to.id).emit("CALL:END", {
        fromUser: data.fromUser,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    const index = USERS.findIndex((user) => user.id === socket.id);
    if (index !== -1) {
      USERS.splice(index, 1);
      io.emit("newUsers", USERS);
    }

    socket.broadcast.emit("USER:DISCONNECT", {
      fromUser: socket.id,
    });
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
