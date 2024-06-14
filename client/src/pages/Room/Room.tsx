import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import { useSocket } from "@src/hooks/useSocket";
import { useWebRTC } from "@src/hooks/useWebRTC ";
import MicOnIcon from "@src/components/ui/icons/MicOnIcon";
import MicOffIcon from "@src/components/ui/icons/MicOffIcon";
import CameraOnIcon from "@src/components/ui/icons/CameraOnIcon";
import CameraOffIcon from "@src/components/ui/icons/CameraOffIcon";
import VideoPlayer from "@src/components/VideoPlayer/VideoPlayer";
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
  const [selectedCamera, setSelectedCamera] = useState("");
  const [isMuted, setIsMuted] = useAtom(isMutedAtom);
  const [cameraOff, setCameraOff] = useAtom(cameraOffAtom);
  const myStream = useAtomValue(myStreamAtom);
  const {
    localVideoRef,
    remoteVideoRef,
    cameraOptions,
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

  const handleCamera = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCamera(e.target.value);
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
      .forEach((track) => (track.enabled = !track.enabled)); // 비디오 트랙을 켜기/끄기
    setCameraOff(!cameraOff);
  };

  return (
    <div>
      {/* <video
        className={styles.local_video}
        ref={localVideoRef}
        autoPlay
        playsInline
      /> */}
      <VideoPlayer videoRef={localVideoRef} />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "45%", margin: "2.5%" }}
      />
      <article className={styles.button_box}>
        <button className={styles.button} onClick={handleMuteClick}>
          <i className={styles.button_icon}>
            {isMuted ? <MicOffIcon /> : <MicOnIcon />}
          </i>
        </button>
        <button className={styles.button} onClick={handleCameraClick}>
          <i className={styles.button_icon}>
            {cameraOff ? <CameraOffIcon /> : <CameraOnIcon />}
          </i>
        </button>
      </article>

      <select
        className={styles.cameras}
        value={selectedCamera}
        onChange={handleCamera}
      >
        {cameraOptions.map(({ deviceId, label }) => {
          return <option key={deviceId}>{label}</option>;
        })}
      </select>
    </div>
  );
}
