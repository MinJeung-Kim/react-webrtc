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
app.use(cors_1.default);
const port = 8080;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
io.on("connection", (socket) => {
    socket.on("join", (room) => {
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
