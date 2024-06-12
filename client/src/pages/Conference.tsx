import { useSocket } from "@src/hooks/useSocket";
import { useWebRTC } from "@src/hooks/useWebRTC ";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

export default function Conference() {
  const { roomId } = useParams<{ roomId: string }>();
  const [isConnected, setIsConnected] = useState(false);

  const {
    localVideoRef,
    remoteVideoRef,
    initializePeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    getUserMedia,
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

    await getUserMedia();

    const offer = await createOffer();
    if (socketId) {
      sendOffer(socketId, offer!, roomId!);
      setIsConnected(true);
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
    </div>
  );
}
