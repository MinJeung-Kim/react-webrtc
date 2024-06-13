import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "@src/hooks/useSocket";
import { useWebRTC } from "@src/hooks/useWebRTC ";
import styles from "./style.module.scss";
import { useAtomValue } from "jotai";
import { camerOptionAtom } from "@src/store/atom";

interface SignalData {
  caller: string;
  target: string;
  sdp: RTCSessionDescriptionInit;
  room: string;
}

interface IceCandidateData {
  candidate: {
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
  };
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [selectedCamera, setSelectedCamera] = useState("");

  const {
    localVideoRef,
    remoteVideoRef,
    camerOptions,
    initializePeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    getMedia,
  } = useWebRTC();

  const handleReceiveOffer = async (message: SignalData) => {
    await setRemoteDescription(message.sdp);
    const answer = await createAnswer();
    sendAnswer(message.caller, answer!, message.room);
  };

  const handleReceiveAnswer = async (message: SignalData) => {
    await setRemoteDescription(message.sdp);
  };

  const handleNewICECandidateMsg = async (message: IceCandidateData) => {
    await addIceCandidate(message.candidate);
  };

  const { joinRoom, sendOffer, sendAnswer, sendIceCandidate, socketId } =
    useSocket(
      handleReceiveOffer,
      handleReceiveAnswer,
      handleNewICECandidateMsg
    );

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      startCall();
    }
  }, [roomId]);

  const startCall = async () => {
    initializePeerConnection(sendIceCandidate, (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    });

    await getMedia();

    const offer = await createOffer();
    if (socketId) {
      sendOffer(socketId, offer!, roomId!);
    } else {
      console.error("Socket ID is undefined");
    }
  };

  return (
    <div>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        style={{ width: "45%", margin: "2.5%" }}
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "45%", margin: "2.5%" }}
      />
      <select className={styles.cameras}>
        {camerOptions.map(({ deviceId, label }) => {
          return <option key={deviceId}>{label}</option>;
        })}
      </select>
    </div>
  );
}
