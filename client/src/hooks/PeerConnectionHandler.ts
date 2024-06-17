import { useCallback, useState, MutableRefObject } from "react";
import { Socket } from "socket.io-client";

interface PeerConnectionObj {
  connection: RTCPeerConnection;
  socketId: string;
  nickname: string;
  remoteStream: MediaStream | null; // 원격 스트림을 추가합니다.
}

const ICE_SERVERS = [{ urls: ["stun:stun.l.google.com:19302"] }];

const usePeerConnections = (
  socket: Socket,
  localStream: MediaStream | null,
  remoteVideoRefs: MutableRefObject<
    Map<string, React.RefObject<HTMLVideoElement>>
  >
) => {
  const [peerConnections, setPeerConnections] = useState<PeerConnectionObj[]>(
    []
  );

  const handleIceCandidate = (
    event: RTCPeerConnectionIceEvent,
    remoteSocketId: string
  ) => {
    if (event.candidate) {
      socket.emit("ice", event.candidate, remoteSocketId);
    }
  };

  const handleTrackEvent = (event: RTCTrackEvent, remoteSocketId: string) => {
    const [remoteStream] = event.streams;
    console.log(`Received remote stream from ${remoteSocketId}:`, remoteStream);
    const remoteVideoRef = remoteVideoRefs.current.get(remoteSocketId);
    if (remoteVideoRef?.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    // 원격 스트림을 업데이트합니다.
    setPeerConnections((prevConnections) =>
      prevConnections.map((pc) => {
        if (pc.socketId === remoteSocketId) {
          return { ...pc, remoteStream };
        }
        return pc;
      })
    );
  };

  const addLocalTracksToConnection = (connection: RTCPeerConnection) => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        connection.addTrack(track, localStream);
      });
    }
  };

  const createPeerConnection = useCallback(
    (remoteSocketId: string, remoteNickname: string): RTCPeerConnection => {
      console.log(
        `Creating PeerConnection for ${remoteSocketId} (${remoteNickname})`
      );
      const connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      connection.onicecandidate = (event) =>
        handleIceCandidate(event, remoteSocketId);
      connection.ontrack = (event) => handleTrackEvent(event, remoteSocketId);

      addLocalTracksToConnection(connection);

      setPeerConnections((prevConnections) => [
        ...prevConnections,
        {
          connection,
          socketId: remoteSocketId,
          nickname: remoteNickname,
          remoteStream: null,
        },
      ]);

      return connection;
    },
    [socket, localStream, remoteVideoRefs]
  );

  return { peerConnections, createPeerConnection, setPeerConnections };
};

export default usePeerConnections;
