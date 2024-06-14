import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { useSocket } from "@src/hooks/useSocket";
import { useWebRTC } from "@src/hooks/useWebRTC ";
import MicOnIcon from "@src/components/ui/icons/MicOnIcon";
import MicOffIcon from "@src/components/ui/icons/MicOffIcon";
import CameraOnIcon from "@src/components/ui/icons/CameraOnIcon";
import CameraOffIcon from "@src/components/ui/icons/CameraOffIcon";
import VideoPlayer from "@src/components/VideoPlayer/VideoPlayer";
import CallButton from "@src/components/CallButton/CallButton";
import OnAndOffButton from "@src/components/OnAndOffButton/OnAndOffButton";
import { cameraOffAtom, isMutedAtom, myStreamAtom } from "@src/store/atom";
import styles from "./style.module.scss";

interface SignalData {
  caller: string;
  target: string;
  sdp: RTCSessionDescriptionInit;
  room: string;
}

interface IceCandidateData {
  candidate: {
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
  };
}

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [isMuted, setIsMuted] = useAtom(isMutedAtom);
  const [cameraOff, setCameraOff] = useAtom(cameraOffAtom);
  const myStream = useAtomValue(myStreamAtom);
  const {
    localVideoRef,
    remoteVideoRef,
    cameraOptions,
    audioOptions,
    initializePeerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    getMedia,
  } = useWebRTC();

  const handleReceiveOffer = async (message: SignalData) => {
    await setRemoteDescription(message.sdp);
    const answer = await createAnswer();
    sendAnswer(message.caller, answer!, message.room);
  };

  const handleReceiveAnswer = async (message: SignalData) => {
    await setRemoteDescription(message.sdp);
  };

  const handleNewICECandidateMsg = async (message: IceCandidateData) => {
    await addIceCandidate(message.candidate);
  };

  const { joinRoom, sendOffer, sendAnswer, sendIceCandidate, socketId } =
    useSocket(
      handleReceiveOffer,
      handleReceiveAnswer,
      handleNewICECandidateMsg
    );

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
      startCall();
    }
  }, [roomId]);

  const startCall = async () => {
    initializePeerConnection(sendIceCandidate, (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    });

    await getMedia();

    const offer = await createOffer();
    if (socketId) {
      sendOffer(socketId, offer!, roomId!);
    } else {
      console.error("Socket ID is undefined");
    }
  };

  const handleMuteClick = () => {
    myStream
      ?.getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const handleCameraClick = () => {
    myStream
      ?.getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setCameraOff(!cameraOff);
  };

  return (
    <div className={styles.room}>
      <VideoPlayer videoRef={localVideoRef} />
      <VideoPlayer videoRef={remoteVideoRef} />
      <article className={styles.button_box}>
        <CallButton />
        <OnAndOffButton
          icon={cameraOff ? <CameraOffIcon /> : <CameraOnIcon />}
          options={cameraOptions}
          onClick={handleCameraClick}
        />
        <OnAndOffButton
          icon={isMuted ? <MicOffIcon /> : <MicOnIcon />}
          options={audioOptions}
          onClick={handleMuteClick}
        />
      </article>
    </div>
  );
}
