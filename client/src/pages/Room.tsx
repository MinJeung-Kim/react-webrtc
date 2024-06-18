import { useAtomValue } from "jotai";
import { Box } from "@mui/material";
import { roomNameAtom } from "@src/store/VideoAtom";
import VideoPlay from "@src/components/VideoPlay";
import VideoControl from "@src/components/VideoControl";
import Chat from "@src/components/Chat";

export default function Room() {
  const roomName = useAtomValue(roomNameAtom);
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
      <Chat />
    </Box>
  );
}
