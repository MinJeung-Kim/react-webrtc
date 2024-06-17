import { useState } from "react";

const useChatMessages = () => {
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  const addChatMessage = (message: string) => {
    setChatMessages((prevMessages) => [...prevMessages, message]);
  };

  return { chatMessages, addChatMessage };
};

export default useChatMessages;
