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

type PcObj = { [key: string]: any };

export default function RoomPage({ socket }: Props) {
  const roomName = useAtomValue(roomNameAtom);
  const myFaceRef = useRef<HTMLVideoElement | null>(null);
  const [chats, setChats] = useState<{ text: string; nickname: string }[]>([]);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const NOTICE_CN = "noticeChat";
  let peopleInRoom = 1;
  let pcObj: PcObj = {
    remoteSocketId: null,
  }; // 피어 연결 객체를 저장할 변수

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
      ); // 사용자 미디어 스트림 가져오기

      setMyStream(stream);

      if (myFaceRef.current && myStream) {
        myFaceRef.current.srcObject = myStream;
      }

      if (!deviceId) {
        // deviceId가 없을 때, 즉 초기 실행일 때
        stream //
          .getAudioTracks()
          .forEach((track) => (track.enabled = false)); // 오디오 트랙 음소거

        // await getCameras(); // 카메라 목록 가져오기
      }
    } catch (error) {
      console.log(error); // 오류 출력
    }
  }

  function handleIce(event: RTCPeerConnectionIceEvent, remoteSocketId: string) {
    if (event.candidate) {
      socket.emit("ice", event.candidate, remoteSocketId); // ICE 후보자 이벤트 전송
    }
  }
  function handleAddStream(
    event: Event,
    remoteSocketId: string,
    remoteNickname: string
  ) {
    console.log("handleAddStream : ", event);

    // const peerStream = event.stream; // 원격 스트림 가져오기
    // paintPeerFace(peerStream, remoteSocketId, remoteNickname); // 원격 스트림 비디오 요소 표시
  }

  function createConnection(remoteSocketId: string, remoteNickname: string) {
    const myPeerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    }); // 새로운 피어 연결 생성 및 STUN 서버 설정
    myPeerConnection.addEventListener("icecandidate", (event) => {
      handleIce(event, remoteSocketId); // ICE 후보자 이벤트 핸들러 등록
    });
    myPeerConnection.addEventListener("addstream", (event) => {
      handleAddStream(event, remoteSocketId, remoteNickname); // 스트림 추가 이벤트 핸들러 등록
    });
    myStream //
      ?.getTracks()
      .forEach((track) => myPeerConnection.addTrack(track, myStream)); // 현재 스트림의 모든 트랙을 피어 연결에 추가

    pcObj[remoteSocketId] = myPeerConnection; // 피어 연결 객체 저장

    ++peopleInRoom; // 방 인원 수 증가
    // sortStreams(); // 스트림 정렬
    return myPeerConnection; // 피어 연결 반환
  }

  const handleAcceptJoin = async (users: UserType[]) => {
    console.log("handleAcceptJoin called", users);

    await getMedia(); // 통화 초기화

    if (users.length >= 0) {
      console.log("More than one user in the room, calling handleWriteChat."); // 로그 추가
      handleWriteChat("Notice!", NOTICE_CN); // 공지 메시지 표시
      for (let i = 0; i < length - 1; ++i) {
        try {
          const newPC = createConnection(users[i].socketId, users[i].nickname); // 새로운 피어 연결 생성
          const offer = await newPC.createOffer(); // 오퍼 생성
          await newPC.setLocalDescription(offer); // 로컬 설명 설정
          // socket.emit("offer", offer, users[i].socketId, nickname); // 오퍼 이벤트 전송
          handleWriteChat(`__${users[i].nickname}__`, NOTICE_CN); // 사용자 닉네임 표시
        } catch (err) {
          console.error(err); // 오류 출력
        }
      }
      handleWriteChat("is in the room.", NOTICE_CN); // 방에 있음 메시지 표시
    }
  };

  useEffect(() => {
    console.log("Setting up socket listeners");

    socket.on("accept_join", handleAcceptJoin);

    return () => {
      console.log("Cleaning up socket listeners");
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
      <Chat chats={chats} setChats={setChats} />
    </Box>
  );
}
