import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { Room } from "./model";

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

let rooms: Room[] = [];
const MAXIMUM = 5;

// 방 찾기 함수
function findRoom(roomName: string) {
  return rooms.find((room) => room.roomName === roomName);
}

io.on("connection", (socket) => {
  socket.on("join", (roomName, nickname) => {
    let targetRooms = findRoom(roomName);

    console.log("targetRooms : ", targetRooms);

    if (targetRooms) {
      // 방이 존재하는 경우
      if (targetRooms.currentNum >= MAXIMUM) {
        // 방 인원이 최대치에 도달했으면
        socket.emit("reject_join"); // 참가 거부 이벤트 전송
        return; // 함수 종료
      }
    } else {
      // 방이 존재하지 않는 경우
      targetRooms = {
        roomName,
        currentNum: 0,
        users: [],
      };
      rooms.push(targetRooms); // 새로운 방 객체를 배열에 추가
    }

    targetRooms.users.push({
      socketId: socket.id,
      nickname,
    }); // 방 객체에 사용자 추가
    ++targetRooms.currentNum;

    socket.join(roomName);
    socket.emit("accept_join", targetRooms.users);
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
