import { useAtomValue } from "jotai";
import { Box } from "@mui/material";
import { roomNameAtom } from "@src/store/VideoAtom";
import Chat from "@src/components/Chat";
import VideoPlay from "@src/components/VideoPlay";
import VideoControl from "@src/components/VideoControl";
import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";

type Props = {
  socket: Socket;
};

type UserType = { socketId: string; nickname: string };

export default function RoomPage({ socket }: Props) {
  const roomName = useAtomValue(roomNameAtom);
  const [chats, setChats] = useState<{ text: string; nickname: string }[]>([]);
  const NOTICE_CN = "noticeChat";

  const handleWriteChat = (text: string, nickname: string) => {
    console.log("handleWriteChat : ", text);
    setChats((prevChats) => [...prevChats, { text, nickname }]);
  };

  const handleAcceptJoin = (users: UserType[]) => {
    console.log("handleAcceptJoin called", users);

    if (users.length >= 0) {
      console.log("More than one user in the room, calling handleWriteChat."); // 로그 추가
      handleWriteChat("Notice!", NOTICE_CN); // 공지 메시지 표시
      handleWriteChat("is in the room.", NOTICE_CN); // 방에 있음 메시지 표시
    }
  };

  useEffect(() => {
    console.log("Setting up socket listeners");

    socket.on("accept_join", handleAcceptJoin);

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("accept_join", handleAcceptJoin);
    };
  }, [socket]);

  return (
    <Box
      className="room"
      sx={{ width: "100%", display: "flex", justifyContent: "center" }}
    >
      <Box
        className="video_wrap"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#eee",
          padding: "2rem",
        }}
      >
        <h1>Room name : {roomName}</h1>
        <VideoPlay />
        <VideoControl />
      </Box>
      <Chat chats={chats} setChats={setChats} />
    </Box>
  );
}
