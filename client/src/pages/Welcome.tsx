import React, { useState } from "react";

interface WelcomeProps {
  joinRoom: (room: string, nick: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ joinRoom }) => {
  const [roomName, setRoomName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    joinRoom(roomName, nickname);
  };

  return (
    <div>
      <h2>Welcome</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};

export default Welcome;
