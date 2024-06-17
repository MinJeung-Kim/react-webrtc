"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const port = 8080;
const server = http_1.default.createServer(app);
const wsServer = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
let roomObjArr = [];
const MAXIMUM = 5;
const findRoom = (roomName) => {
    return roomObjArr.find((room) => room.roomName === roomName) || null;
};
const removeUserFromRoom = (socketId, room) => {
    room.users = room.users.filter((user) => user.socketId !== socketId);
    room.currentNum--;
};
wsServer.on("connection", (socket) => {
    console.log({ socket }); // 이 부분에서 콘솔에 출력
    let myRoomName = null;
    let myNickname = null;
    socket.on("join_room", (roomName, nickname) => {
        myRoomName = roomName;
        myNickname = nickname;
        let targetRoomObj = findRoom(roomName);
        if (targetRoomObj) {
            if (targetRoomObj.currentNum >= MAXIMUM) {
                socket.emit("reject_join");
                return;
            }
        }
        else {
            targetRoomObj = { roomName, currentNum: 0, users: [] };
            roomObjArr.push(targetRoomObj);
        }
        targetRoomObj.users.push({ socketId: socket.id, nickname });
        targetRoomObj.currentNum++;
        socket.join(roomName);
        socket.emit("accept_join", targetRoomObj.users);
        console.log(`${nickname} joined room ${roomName}`);
    });
    socket.on("offer", (offer, remoteSocketId, localNickname) => {
        socket.to(remoteSocketId).emit("offer", offer, socket.id, localNickname);
    });
    socket.on("answer", (answer, remoteSocketId) => {
        socket.to(remoteSocketId).emit("answer", answer, socket.id);
    });
    socket.on("ice", (ice, remoteSocketId) => {
        socket.to(remoteSocketId).emit("ice", ice, socket.id);
    });
    socket.on("chat", (message, roomName) => {
        socket.to(roomName).emit("chat", message);
    });
    socket.on("disconnect", () => {
        if (myRoomName && myNickname) {
            socket.to(myRoomName).emit("leave_room", socket.id, myNickname);
            let targetRoomObj = findRoom(myRoomName);
            if (targetRoomObj) {
                removeUserFromRoom(socket.id, targetRoomObj);
                if (targetRoomObj.currentNum === 0) {
                    roomObjArr = roomObjArr.filter((room) => room.roomName !== myRoomName);
                }
            }
            console.log(`${myNickname} left room ${myRoomName}`);
        }
    });
});
server.listen(port, () => {
    console.log(`server started on port ${port}`);
});
