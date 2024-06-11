import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080"); // 서버와의 소켓 연결 설정

interface SignalData {
  caller: string; // 호출자 ID
  target: string; // 대상자 ID
  sdp: RTCSessionDescriptionInit; // SDP 데이터
}

interface IceCandidateData {
  target: string; // 대상자 ID
  candidate: {
    // ICE 후보 데이터
    candidate: string; // 후보 문자열
    sdpMid: string | null; // sdpMid
    sdpMLineIndex: number | null; // sdpMLineIndex
  };
}

const WebRTCComponent: React.FC = () => {
  // WebRTCComponent 컴포넌트 정의
  const localVideoRef = useRef<HTMLVideoElement>(null); // 로컬 비디오 요소 참조 설정
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // 원격 비디오 요소 참조 설정
  const peerConnection = useRef<RTCPeerConnection | null>(null); // 피어 연결 참조 설정
  const [isConnected, setIsConnected] = useState(false); // 연결 상태 관리
  const [log, setLog] = useState<string[]>([]); // 로그 상태 관리
  const [pendingCandidates, setPendingCandidates] = useState<
    RTCIceCandidateInit[]
  >([]); // 보류 중인 ICE 후보 상태 관리

  useEffect(() => {
    // 컴포넌트 마운트 시 실행되는 훅
    socket.on("offer", handleReceiveOffer); // 'offer' 이벤트 리스너 설정
    socket.on("answer", handleReceiveAnswer); // 'answer' 이벤트 리스너 설정
    socket.on("ice-candidate", handleNewICECandidateMsg); // 'ice-candidate' 이벤트 리스너 설정

    return () => {
      // 컴포넌트 언마운트 시 실행되는 클린업 함수
      socket.off("offer", handleReceiveOffer); // 'offer' 이벤트 리스너 해제
      socket.off("answer", handleReceiveAnswer); // 'answer' 이벤트 리스너 해제
      socket.off("ice-candidate", handleNewICECandidateMsg); // 'ice-candidate' 이벤트 리스너 해제
    };
  }, []); // 빈 배열을 전달하여 한 번만 실행되도록 설정

  const handleReceiveOffer = async (message: SignalData) => {
    // 'offer' 이벤트 처리 함수
    const desc = new RTCSessionDescription(message.sdp); // 수신된 SDP로 RTCSessionDescription 객체 생성
    await peerConnection.current?.setRemoteDescription(desc); // 피어 연결의 원격 설명 설정
    const answer = await peerConnection.current?.createAnswer(); // 응답 생성
    await peerConnection.current?.setLocalDescription(answer); // 로컬 설명 설정
    socket.emit("answer", {
      // 응답을 소켓을 통해 전송
      target: message.caller,
      sdp: peerConnection.current?.localDescription,
    });

    pendingCandidates.forEach(async (candidate) => {
      // 보류 중인 ICE 후보 추가
      await peerConnection.current?.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });
    setPendingCandidates([]); // 보류 중인 ICE 후보 목록 초기화

    appendToLog("Received offer and sent answer"); // 로그에 메시지 추가
  };

  const handleReceiveAnswer = async (message: SignalData) => {
    // 'answer' 이벤트 처리 함수
    const desc = new RTCSessionDescription(message.sdp); // 수신된 SDP로 RTCSessionDescription 객체 생성
    await peerConnection.current?.setRemoteDescription(desc); // 피어 연결의 원격 설명 설정

    pendingCandidates.forEach(async (candidate) => {
      // 보류 중인 ICE 후보 추가
      await peerConnection.current?.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });
    setPendingCandidates([]); // 보류 중인 ICE 후보 목록 초기화

    appendToLog("Received answer"); // 로그에 메시지 추가
  };

  const handleNewICECandidateMsg = async (message: IceCandidateData) => {
    // 'ice-candidate' 이벤트 처리 함수
    if (
      message.candidate.sdpMid === null &&
      message.candidate.sdpMLineIndex === null
    ) {
      // sdpMid와 sdpMLineIndex가 모두 null인 경우
      appendToLog(
        "Ignoring ICE candidate with both sdpMid and sdpMLineIndex null"
      ); // 로그에 무시 메시지 추가
      return; // 후보 무시
    }

    const candidateData: RTCIceCandidateInit = {
      // ICE 후보 데이터 생성
      candidate: message.candidate.candidate,
      sdpMid:
        message.candidate.sdpMid !== null
          ? message.candidate.sdpMid
          : undefined,
      sdpMLineIndex:
        message.candidate.sdpMLineIndex !== null
          ? message.candidate.sdpMLineIndex
          : undefined,
    };

    try {
      const candidate = new RTCIceCandidate(candidateData); // RTCIceCandidate 객체 생성
      if (peerConnection.current?.remoteDescription) {
        // 원격 설명이 설정된 경우
        await peerConnection.current?.addIceCandidate(candidate); // ICE 후보 추가
        appendToLog("Added ICE candidate"); // 로그에 메시지 추가
      } else {
        setPendingCandidates((prev) => [...prev, candidateData]); // 보류 중인 후보 목록에 추가
        appendToLog("Stored ICE candidate"); // 로그에 메시지 추가
      }
    } catch (error) {
      // 오류 발생 시
      appendToLog(`Error adding ICE candidate: ${error}`); // 로그에 오류 메시지 추가
    }
  };

  const startCall = async () => {
    // 통화 시작 함수
    peerConnection.current = new RTCPeerConnection({
      // 피어 연결 생성
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // STUN 서버 설정
        {
          urls: "turn:your-turn-server-domain:3478", // TURN 서버 설정
          username: "username",
          credential: "password",
        },
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      // ICE 후보 이벤트 핸들러 설정
      if (event.candidate) {
        // 후보가 있는 경우
        socket.emit("ice-candidate", {
          // 소켓을 통해 ICE 후보 전송
          target: socket.id,
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid ?? null,
            sdpMLineIndex: event.candidate.sdpMLineIndex ?? null,
          },
        });
        appendToLog("Sent ICE candidate"); // 로그에 메시지 추가
      }
    };

    peerConnection.current.ontrack = (event) => {
      // 트랙 이벤트 핸들러 설정
      if (remoteVideoRef.current) {
        // 원격 비디오 요소가 있는 경우
        remoteVideoRef.current.srcObject = event.streams[0]; // 원격 스트림 설정
      }
      appendToLog("Received remote stream"); // 로그에 메시지 추가
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      // 사용자 미디어 요청
      video: true,
      audio: true,
    });

    if (localVideoRef.current) {
      // 로컬 비디오 요소가 있는 경우
      localVideoRef.current.srcObject = stream; // 로컬 스트림 설정
    }

    stream.getTracks().forEach((track) => {
      // 각 트랙을 피어 연결에 추가
      peerConnection.current?.addTrack(track, stream);
    });

    const offer = await peerConnection.current.createOffer(); // 오퍼 생성
    await peerConnection.current.setLocalDescription(offer); // 로컬 설명 설정

    socket.emit("offer", {
      // 소켓을 통해 오퍼 전송
      caller: socket.id,
      sdp: peerConnection.current.localDescription,
    });

    appendToLog("Started call and sent offer"); // 로그에 메시지 추가

    setIsConnected(true); // 연결 상태 업데이트
  };

  const appendToLog = (message: string) => {
    // 로그 추가 함수
    setLog((prevLog) => [...prevLog, message]); // 로그 상태 업데이트
  };

  return (
    // JSX 반환
    <div>
      <div>
        <video ref={localVideoRef} autoPlay playsInline />
        {/* 로컬 비디오 요소 */}
        <video ref={remoteVideoRef} autoPlay playsInline />
        {/* 원격 비디오 요소 */}
      </div>
      <button onClick={startCall} disabled={isConnected}>
        {/* 통화 시작 버튼 */}
        Start Call
      </button>
      <pre>
        {log.map(
          (
            entry,
            index // 로그 표시
          ) => (
            <div key={index}>{entry}</div>
          )
        )}
      </pre>
    </div>
  );
};

export default WebRTCComponent; // 컴포넌트 내보내기
