"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const socketEvents_1 = require("./events/socketEvents");
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
(0, socketEvents_1.handleSocketConnection)(wsServer);
server.listen(port, () => {
    console.log(`server started on port ${port}`);
});
