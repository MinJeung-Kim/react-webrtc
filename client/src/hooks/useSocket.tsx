import { useEffect, useState } from "react";
import io from "socket.io-client";

const baseURL: string = import.meta.env.VITE_REACT_APP_BASE_URL ?? "";
const socket = io(baseURL );

interface SignalData {
  caller: string;
  target: string;
  sdp: RTCSessionDescriptionInit;
  room: string;
}

interface IceCandidateData {
  target: string;
  candidate: {
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
  };
  room: string;
}

export const useSocket = (
  handleReceiveOffer: (message: SignalData) => void,
  handleReceiveAnswer: (message: SignalData) => void,
  handleNewICECandidateMsg: (message: IceCandidateData) => void
) => {
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    socket.on("offer", handleReceiveOffer);
    socket.on("answer", handleReceiveAnswer);
    socket.on("ice-candidate", handleNewICECandidateMsg);

    return () => {
      socket.off("offer", handleReceiveOffer);
      socket.off("answer", handleReceiveAnswer);
      socket.off("ice-candidate", handleNewICECandidateMsg);
    };
  }, []);

  const joinRoom = (room: string) => {
    if (room) {
      socket.emit("join", room);
      appendToLog(`Joined room: ${room}`);
    }
  };

  const sendOffer = (caller: string, sdp: RTCSessionDescriptionInit, room: string) => {
    socket.emit("offer", { caller, sdp, room });
    appendToLog("Sent offer");
  };

  const sendAnswer = (target: string, sdp: RTCSessionDescriptionInit, room: string) => {
    socket.emit("answer", { target, sdp, room });
    appendToLog("Sent answer");
  };

  const sendIceCandidate = (candidate: RTCIceCandidateInit) => {
    socket.emit("ice-candidate", { candidate });
    appendToLog("Sent ICE candidate");
  };

  const appendToLog = (message: string) => {
    setLog((prevLog) => [...prevLog, message]);
    console.log({ message });
  };

  return {
    log,
    joinRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    socketId: socket.id, // socket.id 반환
  };
};
