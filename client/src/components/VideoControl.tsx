import { Button, IconButton } from "@mui/material";
import { useState } from "react";
import MicOnIcon from "./ui/icons/MicOnIcon";
import MicOffIcon from "./ui/icons/MicOffIcon";
import CameraOnIcon from "./ui/icons/CameraOnIcon";
import CameraOffIcon from "./ui/icons/CameraOffIcon";
import LeaveIcon from "./ui/icons/LeaveIcon";

export default function VideoControl() {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const handleMuteClick = () => {
    setMuted(!muted);
  };

  const handleCameraClick = () => {
    setCameraOff(!cameraOff);
  };

  return (
    <div className="buttons">
      <IconButton aria-label="mute" onClick={handleMuteClick}>
        {muted ? <MicOnIcon /> : <MicOffIcon />}
      </IconButton>
      <IconButton aria-label="camera_off" onClick={handleCameraClick}>
        {cameraOff ? <CameraOnIcon /> : <CameraOffIcon />}
      </IconButton>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        color="error"
        tabIndex={-1}
        startIcon={<LeaveIcon />}
      >
        Leave
      </Button>
    </div>
  );
}
