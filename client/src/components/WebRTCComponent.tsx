import React, { useRef, useEffect, useState } from "react"; // React 라이브러리와 훅 불러오기
import io from "socket.io-client"; // socket.io-client 라이브러리 불러오기

const socket = io("http://localhost:8080"); // 서버와 소켓 연결 설정

// SignalData 인터페이스 정의
interface SignalData {
  caller: string; // 호출자 ID
  target: string; // 대상자 ID
  sdp: RTCSessionDescriptionInit; // SDP 데이터
  room: string; // 룸 ID
}

// IceCandidateData 인터페이스 정의
interface IceCandidateData {
  target: string; // 대상자 ID
  candidate: {
    candidate: string; // 후보 문자열
    sdpMid: string | null; // sdpMid
    sdpMLineIndex: number | null; // sdpMLineIndex
  };
  room: string; // 룸 ID
}

// WebRTCComponent 컴포넌트 정의
const WebRTCComponent: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null); // 로컬 비디오 요소 참조 설정
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // 원격 비디오 요소 참조 설정
  const peerConnection = useRef<RTCPeerConnection | null>(null); // 피어 연결 참조 설정
  const [isConnected, setIsConnected] = useState(false); // 연결 상태 관리
  const [log, setLog] = useState<string[]>([]); // 로그 상태 관리
  const [pendingCandidates, setPendingCandidates] = useState<RTCIceCandidateInit[]>([]); // 보류 중인 ICE 후보 상태 관리
  const [room, setRoom] = useState<string>(""); // 룸 ID 상태 관리

  // 컴포넌트 마운트 시 실행되는 훅
  useEffect(() => {
    socket.on("offer", handleReceiveOffer); // 'offer' 이벤트 리스너 설정
    socket.on("answer", handleReceiveAnswer); // 'answer' 이벤트 리스너 설정
    socket.on("ice-candidate", handleNewICECandidateMsg); // 'ice-candidate' 이벤트 리스너 설정

    // 컴포넌트 언마운트 시 실행되는 클린업 함수
    return () => {
      socket.off("offer", handleReceiveOffer); // 'offer' 이벤트 리스너 해제
      socket.off("answer", handleReceiveAnswer); // 'answer' 이벤트 리스너 해제
      socket.off("ice-candidate", handleNewICECandidateMsg); // 'ice-candidate' 이벤트 리스너 해제
    };
  }, []); // 빈 배열을 전달하여 한 번만 실행되도록 설정

  // 룸 참가 함수
  const joinRoom = () => {
    if (room) {
      socket.emit("join", room); // 소켓을 통해 룸 참가 요청
      appendToLog(`Joined room: ${room}`); // 로그에 메시지 추가
    }
  };

  // 'offer' 이벤트 처리 함수
  const handleReceiveOffer = async (message: SignalData) => {
    if (!peerConnection.current) return; // 피어 연결이 없으면 종료

    const desc = new RTCSessionDescription(message.sdp); // 수신된 SDP로 RTCSessionDescription 객체 생성
    await peerConnection.current.setRemoteDescription(desc); // 피어 연결의 원격 설명 설정
    const answer = await peerConnection.current.createAnswer(); // 응답 생성
    await peerConnection.current.setLocalDescription(answer); // 로컬 설명 설정

    // 소켓을 통해 응답 전송
    socket.emit("answer", {
      target: message.caller,
      sdp: peerConnection.current.localDescription,
      room: message.room,
    });

    // 보류 중인 ICE 후보 추가
    pendingCandidates.forEach(async (candidate) => {
      await peerConnection.current?.addIceCandidate(candidate);
    });
    setPendingCandidates([]); // 보류 중인 ICE 후보 목록 초기화

    appendToLog("Received offer and sent answer"); // 로그에 메시지 추가
  };

  // 'answer' 이벤트 처리 함수
  const handleReceiveAnswer = async (message: SignalData) => {
    if (!peerConnection.current) return; // 피어 연결이 없으면 종료

    const desc = new RTCSessionDescription(message.sdp); // 수신된 SDP로 RTCSessionDescription 객체 생성
    await peerConnection.current.setRemoteDescription(desc); // 피어 연결의 원격 설명 설정

    // 보류 중인 ICE 후보 추가
    pendingCandidates.forEach(async (candidate) => {
      await peerConnection.current?.addIceCandidate(candidate);
    });
    setPendingCandidates([]); // 보류 중인 ICE 후보 목록 초기화

    appendToLog("Received answer"); // 로그에 메시지 추가
  };

  // 새로운 ICE 후보 처리 함수
  const handleNewICECandidateMsg = async (message: IceCandidateData) => {
    const candidateData: RTCIceCandidateInit = {
      candidate: message.candidate.candidate,
      sdpMid: message.candidate.sdpMid ?? undefined,
      sdpMLineIndex: message.candidate.sdpMLineIndex ?? undefined,
    };

    try {
      const candidate = new RTCIceCandidate(candidateData); // RTCIceCandidate 객체 생성

      if (peerConnection.current?.remoteDescription) { // 원격 설명이 설정된 경우
        await peerConnection.current?.addIceCandidate(candidate); // ICE 후보 추가
        appendToLog("Added ICE candidate"); // 로그에 메시지 추가
      } else {
        setPendingCandidates((prev) => [...prev, candidateData]); // 보류 중인 후보 목록에 추가
        appendToLog("Stored ICE candidate"); // 로그에 메시지 추가
      }
    } catch (error) { // 오류 발생 시
      appendToLog(`Error adding ICE candidate: ${error}`); // 로그에 오류 메시지 추가
    }
  };

  // 피어 연결 초기화 함수
  const initializePeerConnection = () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // STUN 서버 설정
        { 
          urls: "turn:localhost:3478", // TURN 서버 설정
          username: "coturn",
          credential: "admin",
        },
      ],
    });

    // ICE 후보 이벤트 핸들러 설정
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) { // 후보가 있는 경우
        socket.emit("ice-candidate", { // 소켓을 통해 ICE 후보 전송
          target: socket.id,
          candidate: event.candidate.toJSON(),
          room,
        });
        appendToLog("Sent ICE candidate"); // 로그에 메시지 추가
      }
    };

    // 트랙 이벤트 핸들러 설정
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) { // 원격 비디오 요소가 있는 경우
        remoteVideoRef.current.srcObject = event.streams[0]; // 원격 스트림 설정
      }
      appendToLog("Received remote stream"); // 로그에 메시지 추가
    };
  };

  // 통화 시작 함수
  const startCall = async () => {
    initializePeerConnection(); // 피어 연결 초기화

    const stream = await navigator.mediaDevices.getUserMedia({ // 사용자 미디어 요청
      video: true,
      audio: true,
    });

    if (localVideoRef.current) { // 로컬 비디오 요소가 있는 경우
      localVideoRef.current.srcObject = stream; // 로컬 스트림 설정
    }

    // 각 트랙을 피어 연결에 추가
    stream.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, stream);
    });

    if (!peerConnection.current) return; // 피어 연결이 없으면 종료

    const offer = await peerConnection.current.createOffer(); // 오퍼 생성
    await peerConnection.current.setLocalDescription(offer); // 로컬 설명 설정

    // 소켓을 통해 오퍼 전송
    socket.emit("offer", {
      caller: socket.id,
      sdp: peerConnection.current.localDescription,
      room,
    });

    appendToLog("Started call and sent offer"); // 로그에 메시지 추가
    setIsConnected(true); // 연결 상태 업데이트
  };

  // 로그 추가 함수
  const appendToLog = (message: string) => {
    setLog((prevLog) => [...prevLog, message]); // 로그 상태 업데이트
    console.log({message}); // 콘솔에 메시지 출력
  };

  // 컴포넌트 렌더링
  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Enter room ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom} disabled={isConnected}>
          Join Room
        </button>
      </div>
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
      <button onClick={startCall} disabled={isConnected || !room}>
        Start Call
      </button>
      <pre>
        {log.map((entry, index) => (
          <div key={index}>{entry}</div>
        ))}
      </pre>
    </div>
  );
};

export default WebRTCComponent; // 컴포넌트 내보내기
