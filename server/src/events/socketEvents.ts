import { Server, Socket } from "socket.io";
import {
  findRoom,
  addUserToRoom,
  removeUserFromRoom,
} from "../controllers/roomController";

export const handleSocketConnection = (wsServer: Server) => {
  wsServer.on("connection", (socket: Socket) => {
    let myRoomName: string | null = null;
    let myNickname: string | null = null;

    socket.on("join_room", (roomName: string, nickname: string) => {
      myRoomName = roomName;
      myNickname = nickname;

      const targetRoomObj = addUserToRoom(roomName, socket.id, nickname);

      if (!targetRoomObj) {
        socket.emit("reject_join");
        return;
      }

      socket.join(roomName);
      socket.emit("accept_join", targetRoomObj.users);
      console.log(`${nickname} joined room ${roomName}`);
    });

    socket.on(
      "offer",
      (offer: any, remoteSocketId: string, localNickname: string) => {
        socket
          .to(remoteSocketId)
          .emit("offer", offer, socket.id, localNickname);
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

        const targetRoomObj = findRoom(myRoomName);
        if (targetRoomObj) {
          removeUserFromRoom(socket.id, targetRoomObj);
        }

        console.log(`${myNickname} left room ${myRoomName}`);
      }
    });
  });
};
