import { useAtomValue } from "jotai";
import { Box } from "@mui/material";
import { roomNameAtom } from "@src/store/VideoAtom";
import Chat from "@src/components/Chat";
import VideoPlay from "@src/components/VideoPlay";
import VideoControl from "@src/components/VideoControl";
import { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

type Props = {
  socket: Socket;
};

type UserType = { socketId: string; nickname: string };

type PcObj = { [key: string]: RTCPeerConnection | null };

export default function RoomPage({ socket }: Props) {
  const roomName = useAtomValue(roomNameAtom);
  const myFaceRef = useRef<HTMLVideoElement | null>(null);
  const [chats, setChats] = useState<{ text: string; nickname: string }[]>([]);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [myPeerConnection, setMyPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const NOTICE_CN = "noticeChat";
  let peopleInRoom = 1;
  let pcObj: PcObj = {};

  const handleWriteChat = (text: string, nickname: string) => {
    console.log("handleWriteChat : ", text);
    setChats((prevChats) => [...prevChats, { text, nickname }]);
  };

  async function getMedia(deviceId?: string) {
    const initialConstraints = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstraints
      );
      setMyStream(stream);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (myFaceRef.current && myStream) {
      myFaceRef.current.srcObject = myStream;
    }
  }, [myStream]);

  function handleIce(event: RTCPeerConnectionIceEvent, remoteSocketId: string) {
    if (event.candidate) {
      socket.emit("ice", event.candidate, remoteSocketId);
    }
  }

  function handleAddStream(
    event: RTCTrackEvent,
    remoteSocketId: string,
    remoteNickname: string
  ) {
    const peerStream = event.streams[0];
    console.log("handleAddStream : ", peerStream);

    paintPeerFace(peerStream, remoteSocketId, remoteNickname); // 원격 스트림 비디오 요소 표시
  }

  function createConnection(remoteSocketId: string, remoteNickname: string) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    });

    setMyPeerConnection(peerConnection);
    console.log("createConnection");

    peerConnection.addEventListener("icecandidate", (event) =>
      handleIce(event, remoteSocketId)
    );
    peerConnection.addEventListener("track", (event) =>
      handleAddStream(event, remoteSocketId, remoteNickname)
    );

    myStream
      ?.getTracks()
      .forEach((track) => peerConnection.addTrack(track, myStream));

    pcObj[remoteSocketId] = peerConnection;
    ++peopleInRoom;
    return peerConnection;
  }

  const handleAcceptJoin = async (users: UserType[]) => {
    console.log("handleAcceptJoin called", users);

    await getMedia();
    if (users.length > 0) {
      const connectToUser = async (user: UserType) => {
        const newPC = createConnection(user.socketId, user.nickname);
        const offer = await newPC.createOffer();
        await newPC.setLocalDescription(offer);
        socket.emit("offer", offer, user.socketId, user.nickname);
        handleWriteChat(`${user.nickname}님이 입장하셨습니다.`, NOTICE_CN);
      };

      for (let i = 0; i < users.length; ++i) {
        try {
          await connectToUser(users[i]);
        } catch (err) {
          console.error(`Error connecting to user ${users[i].nickname}:`, err);
        }
      }
    }
  };

  useEffect(() => {
    socket.on("accept_join", handleAcceptJoin);
    // socket.on("offer", handleOffer);

    return () => {
      socket.off("accept_join", handleAcceptJoin);
    };
  }, [socket]);

  return (
    <Box
      className="room"
      sx={{ width: "100%", display: "flex", justifyContent: "center" }}
    >
      <Box
        className="video_wrap"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#eee",
          padding: "2rem",
        }}
      >
        <h1>Room name : {roomName}</h1>
        <VideoPlay ref={myFaceRef} stream={myStream} />
        <VideoControl />
      </Box>
      <div id="streams"></div>
      <Chat chats={chats} setChats={setChats} />
    </Box>
  );
}
function paintPeerFace(
  peerStream: MediaStream,
  id: string,
  remoteNickname: string
) {
  const streams = document.querySelector("#streams"); // 스트림 요소 선택
  if (!streams) return;

  const div = document.createElement("div"); // 디브 요소 생성
  div.id = id; // 디브 ID 설정
  const video = document.createElement("video"); // 비디오 요소 생성
  video.autoplay = true; // 자동 재생 설정
  video.playsInline = true; // 인라인 재생 설정
  video.width = 400; // 비디오 너비 설정
  video.height = 400; // 비디오 높이 설정
  video.srcObject = peerStream; // 비디오 요소에 원격 스트림 설정
  const nicknameContainer = document.createElement("h3"); // 닉네임 컨테이너 요소 생성
  nicknameContainer.id = "userNickname"; // 닉네임 컨테이너 ID 설정
  nicknameContainer.innerText = remoteNickname; // 닉네임 설정

  div.appendChild(video); // 디브에 비디오 요소 추가
  div.appendChild(nicknameContainer); // 디브에 닉네임 컨테이너 추가
  streams.appendChild(div); // 스트림 요소에 디브 추가
}
