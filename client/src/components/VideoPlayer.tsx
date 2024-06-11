import { RefObject } from "react";

type Props = {
  ref: RefObject<HTMLVideoElement> | null;
};

export const VideoPlayer = ({ ref }: Props) => {
  return <video ref={ref} autoPlay playsInline />;
};
