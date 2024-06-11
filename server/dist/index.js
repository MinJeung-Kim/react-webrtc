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
    console.log("a user connected:", socket.id);
    socket.on("offer", (payload) => {
        io.to(payload.target).emit("offer", payload);
    });
    socket.on("answer", (payload) => {
        io.to(payload.target).emit("answer", payload);
    });
    socket.on("ice-candidate", (incoming) => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected:", socket.id);
    });
});
server.listen(port, () => {
    console.log("server started on port 8080");
});
