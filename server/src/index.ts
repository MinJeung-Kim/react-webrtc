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
  socket.on("join", (room, nickName) => {
    socket.join(room);
  });

  socket.on("offer", (data) => {
    socket.to(data.room).emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.to(data.room).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.room).emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log("server started on port 8080");
});
