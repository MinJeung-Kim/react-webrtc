import { useState } from "react";
import { Box } from "@mui/material";
import JoinPage from "./pages/Join";
import RoomPage from "./pages/Room";

export default function App() {
  const [isCall, setIsCall] = useState(false);
  return (
    <Box className="app" sx={{ width: "100vw", height: "100vh" }}>
      {!isCall ? <JoinPage setIsCall={setIsCall} /> : <RoomPage />}
    </Box>
  );
}
