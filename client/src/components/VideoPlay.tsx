import { useRef } from "react";
import { useAtomValue } from "jotai";
import { nickNameAtom } from "@src/store/VideoAtom";

export default function VideoPlay() {
  const myFaceRef = useRef(null);
  const nickName = useAtomValue(nickNameAtom);

  return (
    <div>
      <video ref={myFaceRef} autoPlay playsInline width="400" height="400" />
      <span className="nickname">닉네임 : {nickName}</span>
    </div>
  );
}
