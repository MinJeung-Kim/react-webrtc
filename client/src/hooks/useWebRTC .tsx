import { useRef } from "react";

export const useWebRTC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const initializePeerConnection = (handleNewICECandidate: (candidate: RTCIceCandidateInit) => void, handleTrackEvent: (event: RTCTrackEvent) => void) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:localhost:3478",
          username: "coturn",
          credential: "admin",
        },
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        handleNewICECandidate(event.candidate.toJSON());
      }
    };

    peerConnection.current.ontrack = handleTrackEvent;
  };

  const createOffer = async () => {
    if (!peerConnection.current) return null;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    return peerConnection.current.localDescription;
  };

  const createAnswer = async () => {
    if (!peerConnection.current) return null;
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    return peerConnection.current.localDescription;
  };

  const setRemoteDescription = async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return;
    const desc = new RTCSessionDescription(sdp);
    await peerConnection.current.setRemoteDescription(desc);
  };

  const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return;
    const iceCandidate = new RTCIceCandidate(candidate);
    await peerConnection.current.addIceCandidate(iceCandidate);
  };

  const getUserMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    stream.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, stream);
    });
    return stream;
  };

  return {
    localVideoRef,
    remoteVideoRef,
    initializePeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    getUserMedia,
  };
};
