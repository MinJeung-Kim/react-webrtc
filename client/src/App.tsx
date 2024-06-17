import React, { useState } from "react";
import { io } from "socket.io-client";
import Call from "./components/Call/Call";
import Welcome from "./pages/Welcome";

const socket = io("http://localhost:8080");

const App: React.FC = () => {
  const [roomName, setRoomName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [inCall, setInCall] = useState<boolean>(false);

  const joinRoom = (room: string, nick: string) => {
    setRoomName(room);
    setNickname(nick);
    setInCall(true);

    socket.emit("join_room", room, nick);
  };

  return (
    <div>
      {inCall ? (
        <Call socket={socket} roomName={roomName} nickname={nickname} />
      ) : (
        <Welcome joinRoom={joinRoom} />
      )}
    </div>
  );
};

export default App;
