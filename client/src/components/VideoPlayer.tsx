import React, { useEffect, useRef } from "react";

interface VideoPlayerProps {
  stream: MediaStream | null;
  nickname: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, nickname }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log("VideoPlayer : ", stream);

      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <>
      <h4>닉네임 : {nickname}</h4>
      <video ref={videoRef} autoPlay playsInline muted />
    </>
  );
};

export default VideoPlayer;
