import React, { useState, useEffect, useRef, useMemo } from "react";
import { Socket } from "socket.io-client";
import useStream from "@src/hooks/useStream";
import useSocket from "@src/hooks/useSocket";
import usePeerConnections from "./PeerConnectionHandler";
import VideoPlayer from "../VideoPlayer";
import Chat from "../Chat";
import Modal from "../Modal";

interface CallProps {
  socket: Socket;
  roomName: string;
  nickname: string;
}

const Call: React.FC<CallProps> = ({ socket, roomName, nickname }) => {
  const { stream, getMedia } = useStream();
  const remoteVideoRefs = useRef<
    Map<string, React.RefObject<HTMLVideoElement>>
  >(new Map());
  const { peerConnections, createPeerConnection, setPeerConnections } =
    usePeerConnections(socket, stream, remoteVideoRefs);
  const [muted, setMuted] = useState<boolean>(true);
  const [cameraOff, setCameraOff] = useState<boolean>(false);
  const [modalText, setModalText] = useState<string>("");
  const [peopleInRoom, setPeopleInRoom] = useState<number>(1);

  useEffect(() => {
    getMedia();
  }, [getMedia]);

  const handleMuteClick = () => {
    if (stream) {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setMuted(!muted);
    }
  };

  const handleCameraClick = () => {
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setCameraOff(!cameraOff);
    }
  };

  const handleLeave = () => {
    socket.disconnect();
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const socketEvents = useMemo(
    () => [
      {
        event: "reject_join",
        handler: () => {
          setModalText("Sorry, The room is already full.");
        },
      },
      {
        event: "accept_join",
        handler: async (userObjArr: any[]) => {
          await getMedia();
          setPeopleInRoom(userObjArr.length);

          userObjArr.forEach(async (userObj) => {
            if (userObj.socketId !== socket.id) {
              const pc = createPeerConnection(
                userObj.socketId,
                userObj.nickname
              );
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit("offer", offer, userObj.socketId, nickname);
            }
          });
        },
      },
      {
        event: "offer",
        handler: async (
          offer: RTCSessionDescriptionInit,
          remoteSocketId: string,
          remoteNickname: string
        ) => {
          const pc = createPeerConnection(remoteSocketId, remoteNickname);
          await pc.setRemoteDescription(offer);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", answer, remoteSocketId);
        },
      },
      {
        event: "answer",
        handler: async (
          answer: RTCSessionDescriptionInit,
          remoteSocketId: string
        ) => {
          const pc = peerConnections.find(
            (p) => p.socketId === remoteSocketId
          )?.connection;
          if (pc) {
            await pc.setRemoteDescription(answer);
          }
        },
      },
      {
        event: "ice",
        handler: async (ice: RTCIceCandidate, remoteSocketId: string) => {
          const pc = peerConnections.find(
            (p) => p.socketId === remoteSocketId
          )?.connection;
          if (pc) {
            await pc.addIceCandidate(ice);
          }
        },
      },
      {
        event: "leave_room",
        handler: (leavedSocketId: string, nickname: string) => {
          setPeopleInRoom((prev) => prev - 1);
          setPeerConnections((prev) =>
            prev.filter((p) => p.socketId !== leavedSocketId)
          );
          remoteVideoRefs.current.delete(leavedSocketId);
        },
      },
    ],
    [createPeerConnection, getMedia, nickname, peerConnections, socket]
  );

  useSocket(socket, socketEvents);

  return (
    <div>
      <h2>Room: {roomName}</h2>
      <h3>People in room: {peopleInRoom}</h3>
      <VideoPlayer stream={stream} />
      {peerConnections.map((peer) => {
        if (!remoteVideoRefs.current.has(peer.socketId)) {
          remoteVideoRefs.current.set(
            peer.socketId,
            React.createRef<HTMLVideoElement>()
          );
        }
        const remoteVideoRef = remoteVideoRefs.current.get(peer.socketId);
        return (
          <div key={peer.socketId}>
            <h4>닉네임 : {peer.nickname}</h4>
            <video ref={remoteVideoRef} autoPlay playsInline />
          </div>
        );
      })}
      <button onClick={handleMuteClick}>{muted ? "Unmute" : "Mute"}</button>
      <button onClick={handleCameraClick}>
        {cameraOff ? "Turn Camera On" : "Turn Camera Off"}
      </button>
      <button onClick={handleLeave}>Leave</button>
      <Chat socket={socket} roomName={roomName} nickname={nickname} />
      <Modal text={modalText} setText={setModalText} />
    </div>
  );
};

export default Call;
