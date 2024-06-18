import { useState } from "react";
import Join from "./pages/Join/Join";
import Room from "./pages/Room";
import { Box } from "@mui/material";

export default function App() {
  const [isCall, setIsCall] = useState(false);
  return (
    <Box className="app" sx={{ width: "100vw", height: "100vh" }}>
      {!isCall ? <Join setIsCall={setIsCall} /> : <Room />}
    </Box>
  );
}
