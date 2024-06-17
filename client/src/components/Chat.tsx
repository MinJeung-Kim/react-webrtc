import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

interface ChatProps {
  socket: Socket;
  roomName: string;
  nickname: string;
}

const Chat: React.FC<ChatProps> = ({ socket, roomName, nickname }) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("chat", (message: string) => {
      setMessages((prevMessages) => [message, ...prevMessages]);
    });

    return () => {
      socket.off("chat");
    };
  }, [socket]);

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    socket.emit("chat", `${nickname}: ${message}`, roomName);
    setMessages((prevMessages) => [`You: ${message}`, ...prevMessages]);
    setMessage("");
  };

  return (
    <div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
