import { useState } from "react";
import { Box } from "@mui/material";
import socketIOClient from "socket.io-client";
import JoinPage from "./pages/Join";
import RoomPage from "./pages/Room";

const baseURL = import.meta.env.VITE_REACT_APP_BASE_URL;
const socket = socketIOClient(baseURL);

export default function App() {
  const [isCall, setIsCall] = useState(false);
  return (
    <Box className="app" sx={{ width: "100vw", height: "100vh" }}>
      {!isCall ? (
        <JoinPage setIsCall={setIsCall} socket={socket} />
      ) : (
        <RoomPage socket={socket} />
      )}
    </Box>
  );
}
