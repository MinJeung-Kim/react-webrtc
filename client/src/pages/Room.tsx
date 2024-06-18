import { useAtomValue } from "jotai";
import { roomNameAtom } from "@src/store/VideoAtom";
import VideoPlay from "@src/components/VideoPlay";
import VideoControl from "@src/components/VideoControl";

export default function Room() {
  const roomName = useAtomValue(roomNameAtom);
  return (
    <div className="room">
      <h1>Romm name : {roomName}</h1>
      <div className="video_wrap">
        <VideoPlay />
        <VideoControl />
      </div>
      <div className="chat_wrap"></div>
    </div>
  );
}
