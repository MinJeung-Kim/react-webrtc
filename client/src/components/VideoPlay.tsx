import { useRef } from "react";
import { useAtomValue } from "jotai";
import { nickNameAtom } from "@src/store/VideoAtom";
import { Box } from "@mui/material";

export default function VideoPlay() {
  const myFaceRef = useRef(null);
  const nickName = useAtomValue(nickNameAtom);

  return (
    <Box
      className="video_box"
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <video ref={myFaceRef} autoPlay playsInline width="400" height="400" />
      <span className="nickname">닉네임 : {nickName}</span>
    </Box>
  );
}
