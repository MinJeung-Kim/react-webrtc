import React, { useEffect, RefObject, useRef } from "react";

interface RemoteVideoProps {
  nickname: string;
  // videoRef: RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({
  nickname,
  // videoRef,
  stream,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [videoRef, stream]);

  return (
    <div>
      <h4>닉네임 : {nickname}</h4>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
};

export default RemoteVideo;
