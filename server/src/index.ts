import express from "express";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";

const app = express();
app.use(cors());
const port = 8080;
const server = http.createServer(app);
const wsServer = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

interface User {
  socketId: string;
  nickname: string;
}

interface Room {
  roomName: string;
  currentNum: number;
  users: User[];
}

let roomObjArr: Room[] = [];
const MAXIMUM = 5;

const findRoom = (roomName: string): Room | null => {
  return roomObjArr.find((room) => room.roomName === roomName) || null;
};

const removeUserFromRoom = (socketId: string, room: Room): void => {
  room.users = room.users.filter((user) => user.socketId !== socketId);
  room.currentNum--;
};

wsServer.on("connection", (socket: Socket) => {
  console.log({ socket }); // 이 부분에서 콘솔에 출력

  let myRoomName: string | null = null;
  let myNickname: string | null = null;

  socket.on("join_room", (roomName: string, nickname: string) => {
    myRoomName = roomName;
    myNickname = nickname;

    let targetRoomObj = findRoom(roomName);

    if (targetRoomObj) {
      if (targetRoomObj.currentNum >= MAXIMUM) {
        socket.emit("reject_join");
        return;
      }
    } else {
      targetRoomObj = { roomName, currentNum: 0, users: [] };
      roomObjArr.push(targetRoomObj);
    }

    targetRoomObj.users.push({ socketId: socket.id, nickname });
    targetRoomObj.currentNum++;

    socket.join(roomName);
    socket.emit("accept_join", targetRoomObj.users);
    console.log(`${nickname} joined room ${roomName}`);
  });

  socket.on(
    "offer",
    (offer: any, remoteSocketId: string, localNickname: string) => {
      socket.to(remoteSocketId).emit("offer", offer, socket.id, localNickname);
    }
  );

  socket.on("answer", (answer: any, remoteSocketId: string) => {
    socket.to(remoteSocketId).emit("answer", answer, socket.id);
  });

  socket.on("ice", (ice: any, remoteSocketId: string) => {
    socket.to(remoteSocketId).emit("ice", ice, socket.id);
  });

  socket.on("chat", (message: string, roomName: string) => {
    socket.to(roomName).emit("chat", message);
  });

  socket.on("disconnect", () => {
    if (myRoomName && myNickname) {
      socket.to(myRoomName).emit("leave_room", socket.id, myNickname);

      let targetRoomObj = findRoom(myRoomName);
      if (targetRoomObj) {
        removeUserFromRoom(socket.id, targetRoomObj);

        if (targetRoomObj.currentNum === 0) {
          roomObjArr = roomObjArr.filter(
            (room) => room.roomName !== myRoomName
          );
        }
      }
      console.log(`${myNickname} left room ${myRoomName}`);
    }
  });
});

server.listen(port, () => {
  console.log(`server started on port ${port}`);
});
