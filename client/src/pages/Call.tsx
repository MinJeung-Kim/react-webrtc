import React, { useState, useEffect, useRef, useMemo } from "react";
import useStream from "@src/hooks/useStream";
import useSocket from "@src/hooks/useSocket";
import VideoPlayer from "../components/VideoPlayer";
import Chat from "../components/Chat";
import Modal from "../components/Modal";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import usePeerConnections from "@src/hooks/PeerConnectionHandler";
import RemoteVideo from "../components/RemoteVideo";
import { Socket } from "socket.io-client";

interface CallProps {
  socket: Socket;
  roomName: string;
  nickname: string;
}
const Call: React.FC<CallProps> = ({ socket, roomName, nickname }) => {
  const { stream, cameraOptions, audioOptions, getMedia } = useStream();
  const remoteVideoRefs = useRef<
    Map<string, React.RefObject<HTMLVideoElement>>
  >(new Map());
  const { peerConnections, createPeerConnection, setPeerConnections } =
    usePeerConnections(socket, stream, remoteVideoRefs);

  const [muted, setMuted] = useState<boolean>(true);
  const [cameraOff, setCameraOff] = useState<boolean>(false);
  const [modalText, setModalText] = useState<string>("");
  const [peopleInRoom, setPeopleInRoom] = useState<number>(1);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedAudio, setSelectedAudio] = useState<string>("");

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

  const handleAudioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAudio(e.target.value);
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value);
  };

  const socketEvents = useMemo(
    () => [
      {
        event: "reject_join",
        handler: () => setModalText("Sorry, The room is already full."),
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

  const renderRemoteVideos = () => {
    return peerConnections.map((peer) => {
      console.log("renderRemoteVideos : ", peer);

      if (!remoteVideoRefs.current.has(peer.socketId)) {
        remoteVideoRefs.current.set(
          peer.socketId,
          React.createRef<HTMLVideoElement>()
        );
      }
      // const remoteVideoRef = remoteVideoRefs.current.get(peer.socketId);
      // const remoteVideoRef = useRef<HTMLVideoElement>(null);
      return (
        <RemoteVideo
          key={peer.socketId}
          nickname={peer.nickname}
          // videoRef={remoteVideoRef!}
          stream={peer.remoteStream}
        />
      );
    });
  };

  return (
    <div>
      <h2>Room: {roomName}</h2>
      <h3>People in room: {peopleInRoom}</h3>
      <VideoPlayer stream={stream} nickname={nickname} />
      {renderRemoteVideos()}
      <Button onClick={handleMuteClick} label={muted ? "Unmute" : "Mute"} />
      <Select
        options={audioOptions}
        onChange={handleAudioChange}
        selected={selectedAudio}
      />
      <Button
        onClick={handleCameraClick}
        label={cameraOff ? "Turn Camera On" : "Turn Camera Off"}
      />
      <Select
        options={cameraOptions}
        onChange={handleCameraChange}
        selected={selectedCamera}
      />
      <Button onClick={handleLeave} label="Leave" />
      <Chat socket={socket} roomName={roomName} nickname={nickname} />
      <Modal text={modalText} setText={setModalText} />
    </div>
  );
};

export default Call;
