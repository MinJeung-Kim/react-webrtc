import { useCallback, useState } from "react";
import { Socket } from "socket.io-client";

interface PeerConnectionObj {
  connection: RTCPeerConnection;
  socketId: string;
  nickname: string;
}

const usePeerConnections = (
  socket: Socket,
  stream: MediaStream | null,
  remoteVideoRefs: React.MutableRefObject<
    Map<string, React.RefObject<HTMLVideoElement>>
  >
) => {
  const [peerConnections, setPeerConnections] = useState<PeerConnectionObj[]>(
    []
  );

  const createPeerConnection = useCallback(
    (remoteSocketId: string, remoteNickname: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice", event.candidate, remoteSocketId);
        }
      };

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        const remoteVideoRef = remoteVideoRefs.current.get(remoteSocketId);
        if (remoteVideoRef?.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      stream?.getTracks().forEach((track) => pc.addTrack(track, stream));

      setPeerConnections((prev) => [
        ...prev,
        { connection: pc, socketId: remoteSocketId, nickname: remoteNickname },
      ]);

      return pc;
    },
    [socket, stream, remoteVideoRefs]
  );

  return { peerConnections, createPeerConnection, setPeerConnections };
};

export default usePeerConnections;
