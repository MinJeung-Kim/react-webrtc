import { useAtomValue } from "jotai";
import { nickNameAtom } from "@src/store/VideoAtom";
import { Box } from "@mui/material";
import { useEffect, forwardRef } from "react";

type Props = {
  stream: MediaStream | null;
};

const VideoPlay = forwardRef<HTMLVideoElement, Props>(({ stream }, ref) => {
  const nickName = useAtomValue(nickNameAtom);

  useEffect(() => {
    if (ref && typeof ref !== "function" && ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream, ref]);

  return (
    <Box
      className="video_box"
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <video ref={ref} autoPlay playsInline width="400" height="400" />
      <span className="nickname">닉네임 : {nickName}</span>
    </Box>
  );
});

export default VideoPlay;
