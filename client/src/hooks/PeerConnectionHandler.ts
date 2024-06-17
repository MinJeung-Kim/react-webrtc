import { useCallback, useState, MutableRefObject } from "react";
import { Socket } from "socket.io-client";

interface PeerConnectionObj {
  connection: RTCPeerConnection; // WebRTC 연결 객체
  socketId: string; // 소켓 ID
  nickname: string; // 닉네임
}

// 커스텀 훅을 정의
const usePeerConnections = (
  socket: Socket, // 소켓 객체
  stream: MediaStream | null, // 로컬 미디어 스트림
  remoteVideoRefs: MutableRefObject<
    Map<string, React.RefObject<HTMLVideoElement>>
  > // 원격 비디오 요소의 참조를 저장하는 맵
) => {
  // 피어 연결 객체 배열을 상태로 관리
  const [peerConnections, setPeerConnections] = useState<PeerConnectionObj[]>(
    []
  );

  // 피어 연결을 생성하는 함수
  const createPeerConnection = useCallback(
    (remoteSocketId: string, remoteNickname: string): RTCPeerConnection => {
      // 새로운 RTCPeerConnection 객체를 생성
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302"], // STUN 서버 설정
          },
        ],
      });

      // ICE 후보가 발견되면 소켓을 통해 전송
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice", event.candidate, remoteSocketId);
        }
      };

      // 원격 트랙이 추가되면 실행되는 콜백 함수
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams; // 원격 스트림을 가져옴
        console.log("ontrack event: ", remoteStream); // 디버깅용 로그 출력
        const remoteVideoRef = remoteVideoRefs.current.get(remoteSocketId); // 원격 비디오 참조를 가져옴
        if (remoteVideoRef?.current) {
          remoteVideoRef.current.srcObject = remoteStream; // 원격 비디오 요소에 스트림 설정
        }
      };

      // 로컬 스트림의 트랙을 피어 연결에 추가
      if (stream) {
        console.log("Adding tracks to peer connection"); // 디버깅용 로그 출력
        stream.getTracks().forEach((track) => {
          console.log("Adding track: ", track); // 디버깅용 로그 출력
          pc.addTrack(track, stream); // 트랙을 피어 연결에 추가
          console.log("pc: ", pc); // 디버깅용 로그 출력
        });
      }

      // 새로운 피어 연결 객체를 상태에 추가
      setPeerConnections((prev) => [
        ...prev,
        { connection: pc, socketId: remoteSocketId, nickname: remoteNickname },
      ]);

      return pc; // 피어 연결 객체 반환
    },
    [socket, stream, remoteVideoRefs] // 의존성 배열: 이 값들이 변경되면 함수가 다시 생성됨
  );

  return { peerConnections, createPeerConnection, setPeerConnections }; // 피어 연결 배열과 생성 함수를 반환
};

export default usePeerConnections;
