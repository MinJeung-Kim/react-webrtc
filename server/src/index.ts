import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { handleSocketConnection } from "./events/socketEvents";

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

handleSocketConnection(wsServer);

server.listen(port, () => {
  console.log(`server started on port ${port}`);
});
