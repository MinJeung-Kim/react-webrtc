import { useEffect } from "react";
import io from "socket.io-client";

const baseURL: string = import.meta.env.VITE_REACT_APP_BASE_URL ?? "";
const socket = io(baseURL);

interface SignalData {
  caller: string; // 호출자 ID
  target: string; // 대상자 ID
  sdp: RTCSessionDescriptionInit; // SDP 데이터
  room: string; // 룸 ID
}

interface IceCandidateData {
  target: string; // 대상자 ID
  candidate: {
    candidate: string; // ICE 후보 문자열
    sdpMid: string | null; // sdpMid
    sdpMLineIndex: number | null; // sdpMLineIndex
  };
  room: string; // 룸 ID
}

export interface User {
  socketId: string;
  nickname: string;
}

export const useSocket = (
  handleReceiveOffer: (message: SignalData) => void, // 오퍼 수신 핸들러
  handleReceiveAnswer: (message: SignalData) => void, // 응답 수신 핸들러
  handleNewICECandidateMsg: (message: IceCandidateData) => void // 새로운 ICE 후보 수신 핸들러
) => {
  // 컴포넌트 마운트 시 소켓 이벤트 설정
  useEffect(() => {
    socket.on("offer", handleReceiveOffer); // 로그 상태 관리
    socket.on("answer", handleReceiveAnswer); // "answer" 이벤트 처리
    socket.on("ice-candidate", handleNewICECandidateMsg); // "ice-candidate" 이벤트 처리
    socket.on("accept_join", handleAccept);
    // 클린업 함수로 이벤트 해제
    return () => {
      socket.off("offer", handleReceiveOffer);
      socket.off("answer", handleReceiveAnswer);
      socket.off("ice-candidate", handleNewICECandidateMsg);
      socket.off("accept_join", handleAccept);
    };
  }, []);

  function handleAccept(users: User[]) {
    const uniqueUsers = Array.from(
      new Set(users.map((user) => user.socketId))
    ).map((socketId) => users.find((user) => user.socketId === socketId)!);
    console.log("handleAccept : ", uniqueUsers);
  }

  const joinRoom = (room: string, nickName: string) => {
    if (room) {
      socket.emit("join", room, nickName); // 소켓을 통해 "join" 이벤트 전송
    }
  };

  const sendOffer = (
    caller: string,
    sdp: RTCSessionDescriptionInit,
    room: string
  ) => {
    socket.emit("offer", { caller, sdp, room }); // 소켓을 통해 "offer" 이벤트 전송
  };

  const sendAnswer = (
    target: string,
    sdp: RTCSessionDescriptionInit,
    room: string
  ) => {
    socket.emit("answer", { target, sdp, room }); // 소켓을 통해 "answer" 이벤트 전송
  };

  const sendIceCandidate = (candidate: RTCIceCandidateInit) => {
    socket.emit("ice-candidate", { candidate }); // 소켓을 통해 "ice-candidate" 이벤트 전송
  };

  return {
    joinRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    socketId: socket.id, // socket.id 반환
  };
};
