import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

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

const WebRTCComponent: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [pendingCandidates, setPendingCandidates] = useState<
    RTCIceCandidateInit[]
  >([]);
  const [room, setRoom] = useState<string>("");

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

  const joinRoom = () => {
    if (room) {
      socket.emit("join", room);
      appendToLog(`Joined room: ${room}`);
    }
  };

  const handleReceiveOffer = async (message: SignalData) => {
    if (!peerConnection.current) return;

    const desc = new RTCSessionDescription(message.sdp);
    await peerConnection.current.setRemoteDescription(desc);
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answer", {
      target: message.caller,
      sdp: peerConnection.current.localDescription,
      room: message.room,
    });

    pendingCandidates.forEach(async (candidate) => {
      await peerConnection.current?.addIceCandidate(candidate);
    });
    setPendingCandidates([]);

    appendToLog("Received offer and sent answer");
  };

  const handleReceiveAnswer = async (message: SignalData) => {
    if (!peerConnection.current) return;

    const desc = new RTCSessionDescription(message.sdp);
    await peerConnection.current.setRemoteDescription(desc);

    pendingCandidates.forEach(async (candidate) => {
      await peerConnection.current?.addIceCandidate(candidate);
    });
    setPendingCandidates([]);

    appendToLog("Received answer");
  };

  const handleNewICECandidateMsg = async (message: IceCandidateData) => {
    const candidateData: RTCIceCandidateInit = {
      candidate: message.candidate.candidate,
      sdpMid: message.candidate.sdpMid ?? undefined,
      sdpMLineIndex: message.candidate.sdpMLineIndex ?? undefined,
    };

    try {
      const candidate = new RTCIceCandidate(candidateData);

      if (peerConnection.current?.remoteDescription) {
        await peerConnection.current?.addIceCandidate(candidate);
        appendToLog("Added ICE candidate");
      } else {
        setPendingCandidates((prev) => [...prev, candidateData]);
        appendToLog("Stored ICE candidate");
      }
    } catch (error) {
      appendToLog(`Error adding ICE candidate: ${error}`);
    }
  };

  const initializePeerConnection = () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          // 3f7e05298dc32465390218198ebc6a04ef503c57ad0d716010dbafc0828ebc74
          urls: "turn:localhost:3478",
          username: "coturn",
          credential: "admin",
        },
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          target: socket.id,
          candidate: event.candidate.toJSON(),
          room,
        });
        appendToLog("Sent ICE candidate");
      }
    };

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      appendToLog("Received remote stream");
    };
  };

  const startCall = async () => {
    initializePeerConnection();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, stream);
    });

    if (!peerConnection.current) return;

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("offer", {
      caller: socket.id,
      sdp: peerConnection.current.localDescription,
      room,
    });

    appendToLog("Started call and sent offer");
    setIsConnected(true);
  };

  const appendToLog = (message: string) => {
    setLog((prevLog) => [...prevLog, message]);
    console.log(message); // 콘솔에 로그 출력
  };

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

export default WebRTCComponent;
