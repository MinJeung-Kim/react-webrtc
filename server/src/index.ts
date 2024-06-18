import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors);
const port = 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (room, nickName) => {
    socket.join(room);
    console.log(
      `User ${socket.id} joined room: ${room} , nickName: ${nickName}`
    );
  });

  socket.on("offer", (data) => {
    console.log(`Offer from ${data.caller} to room ${data.room}`);
    socket.to(data.room).emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log(`Answer from ${data.target} to room ${data.room}`);
    socket.to(data.room).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    console.log(`ICE Candidate from ${data.target} to room ${data.room}`);
    socket.to(data.room).emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log("server started on port 8080");
});
