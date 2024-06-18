// App.tsx

import React, {
  useState,
  useRef,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io();

interface PeerConnections {
  [key: string]: RTCPeerConnection;
}

interface PeerStream {
  id: string;
  stream: MediaStream;
  nickname: string;
}

const App: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peerStreams, setPeerStreams] = useState<PeerStream[]>([]);
  const [isCall, setIsCall] = useState(false);
  const [muted, setMuted] = useState(true);
  const [cameraOff, setCameraOff] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [nickname, setNickname] = useState("");
  const [inputs, setInputs] = useState({
    roomName: "",
    nickname: "",
  });
  const [peopleInRoom, setPeopleInRoom] = useState(1);
  const [peerConnections, setPeerConnections] = useState<PeerConnections>({});

  const myFaceRef = useRef<HTMLVideoElement>(null);
  const camerasSelectRef = useRef<HTMLSelectElement>(null);
  const chatBoxRef = useRef<HTMLUListElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const HIDDEN_CN = "hidden";

  useEffect(() => {
    socket.on("reject_join", handleRejectJoin);
    socket.on("accept_join", handleAcceptJoin);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice", handleIce);
    socket.on("chat", handleChat);
    socket.on("leave_room", handleLeaveRoom);

    return () => {
      socket.off("reject_join", handleRejectJoin);
      socket.off("accept_join", handleAcceptJoin);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice", handleIce);
      socket.off("chat", handleChat);
      socket.off("leave_room", handleLeaveRoom);
    };
  }, []);

  const handleRejectJoin = () => {
    paintModal("Sorry, The room is already full.");
    setNickname("");
    setRoomName("");
  };

  const handleAcceptJoin = async (
    userObjArr: { socketId: string; nickname: string }[]
  ) => {
    // await initCall();
    if (userObjArr.length === 1) return;

    writeChat("Notice!", "noticeChat");
    for (let i = 0; i < userObjArr.length - 1; ++i) {
      try {
        const newPC = createConnection(
          userObjArr[i].socketId,
          userObjArr[i].nickname
        );
        const offer = await newPC.createOffer();
        await newPC.setLocalDescription(offer);
        socket.emit("offer", offer, userObjArr[i].socketId, nickname);
        writeChat(`__${userObjArr[i].nickname}__`, "noticeChat");
      } catch (err) {
        console.error(err);
      }
    }
    writeChat("is in the room.", "noticeChat");
  };

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    remoteSocketId: string,
    remoteNickname: string
  ) => {
    try {
      const newPC = createConnection(remoteSocketId, remoteNickname);
      await newPC.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await newPC.createAnswer();
      await newPC.setLocalDescription(answer);
      socket.emit("answer", answer, remoteSocketId);
      writeChat(`notice! __${remoteNickname}__ joined the room`, "noticeChat");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswer = async (
    answer: RTCSessionDescriptionInit,
    remoteSocketId: string
  ) => {
    await peerConnections[remoteSocketId].setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  };

  const handleIce = async (ice: RTCIceCandidate, remoteSocketId: string) => {
    await peerConnections[remoteSocketId].addIceCandidate(
      new RTCIceCandidate(ice)
    );
  };

  const handleChat = (message: string) => {
    writeChat(message);
  };

  const handleLeaveRoom = (leavedSocketId: string, nickname: string) => {
    removeVideo(leavedSocketId);
    writeChat(`notice! ${nickname} leaved the room.`, "noticeChat");
    setPeopleInRoom((prev) => prev - 1);
    sortStreams();
    setIsCall(true);
  };

  const getCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const currentCamera = stream?.getVideoTracks()[0];

      if (camerasSelectRef.current) {
        camerasSelectRef.current.innerHTML = "";
        cameras.forEach((camera) => {
          const option = document.createElement("option");
          option.value = camera.deviceId;
          option.innerText = camera.label;
          if (currentCamera && currentCamera.label === camera.label) {
            option.selected = true;
          }
          camerasSelectRef.current?.appendChild(option);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMedia = async (deviceId?: string) => {
    const initialConstraints = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstraints : initialConstraints
      );

      if (myFaceRef.current) {
        myFaceRef.current.srcObject = newStream;
        myFaceRef.current.muted = true;
      }
      setStream(newStream);

      if (!deviceId) {
        newStream.getAudioTracks().forEach((track) => (track.enabled = false));
        await getCameras();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMuteClick = () => {
    if (stream) {
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setMuted((prev) => !prev);
    }
  };

  const handleCameraClick = () => {
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
      setCameraOff((prev) => !prev);
    }
  };

  const handleCameraChange = async () => {
    await getMedia(camerasSelectRef.current?.value);
    if (stream && Object.keys(peerConnections).length > 0) {
      const newVideoTrack = stream.getVideoTracks()[0];
      Object.values(peerConnections).forEach((peerConnection) => {
        const sender = peerConnection
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(newVideoTrack);
        }
      });
    }
  };

  const handleWelcomeSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setIsCall(true);
    await getMedia();

    if (socket.disconnected) {
      socket.connect();
    }

    socket.emit("join_room", roomName, nickname);
  };

  const createConnection = (
    remoteSocketId: string,
    remoteNickname: string
  ): RTCPeerConnection => {
    const myPeerConnection = new RTCPeerConnection({
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

    myPeerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        socket.emit("ice", event.candidate, remoteSocketId);
      }
    });

    myPeerConnection.addEventListener("track", (event: RTCTrackEvent) => {
      // const peerStream = event.streams[0];
      const peerStream = event.streams[0];
      paintPeerFace(peerStream, remoteSocketId, remoteNickname);
    });

    if (stream) {
      stream
        .getTracks()
        .forEach((track) => myPeerConnection.addTrack(track, stream));
    }
    setPeerConnections((prev) => ({
      ...prev,
      [remoteSocketId]: myPeerConnection,
    }));
    setPeopleInRoom((prev) => prev + 1);
    sortStreams();

    return myPeerConnection;
  };

  // const paintPeerFace = (
  //   peerStream: MediaStream,
  //   id: string,
  //   remoteNickname: string
  // ) => {
  //   const streams = document.querySelector("#streams");
  //   const div = document.createElement("div");
  //   div.id = id;
  //   const video = document.createElement("video");
  //   video.autoplay = true;
  //   video.playsInline = true;
  //   video.width = 400;
  //   video.height = 400;
  //   video.srcObject = peerStream;
  //   const nicknameContainer = document.createElement("h3");
  //   nicknameContainer.id = "userNickname";
  //   nicknameContainer.innerText = remoteNickname;

  //   div.appendChild(video);
  //   div.appendChild(nicknameContainer);
  //   streams?.appendChild(div);
  //   sortStreams();
  // };

  const paintPeerFace = (
    peerStream: MediaStream,
    id: string,
    remoteNickname: string
  ) => {
    setPeerStreams((prev) => [
      ...prev,
      { id, stream: peerStream, nickname: remoteNickname },
    ]);
  };

  const sortStreams = () => {
    const streams = document.querySelector("#streams");
    const streamArr = streams?.querySelectorAll("div");
    streamArr?.forEach(
      (stream) => (stream.className = `people${peopleInRoom}`)
    );
  };

  const writeChat = (message: string, className: string | null = null) => {
    const chatBox = chatBoxRef.current;
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.innerText = message;
    li.appendChild(span);
    if (className) {
      li.classList.add(className);
    }
    chatBox?.prepend(li);
  };

  const handleChatSubmit = (event: FormEvent) => {
    event.preventDefault();
    const chatInput = chatBoxRef.current?.querySelector(
      "input"
    ) as HTMLInputElement;
    const message = chatInput.value;
    chatInput.value = "";
    socket.emit("chat", `${nickname}: ${message}`, roomName);
    writeChat(`You: ${message}`, "myChat");
  };

  const leaveRoom = () => {
    socket.disconnect();

    setPeerConnections({});
    setPeopleInRoom(1);
    setNickname("");
    stream?.getTracks().forEach((track) => track.stop());
    if (myFaceRef.current) {
      myFaceRef.current.srcObject = null;
    }

    clearAllVideos();
    clearAllChat();
  };

  const removeVideo = (leavedSocketId: string) => {
    const streams = document.querySelector("#streams");
    const streamArr = streams?.querySelectorAll("div");
    streamArr?.forEach((streamElement) => {
      if (streamElement.id === leavedSocketId) {
        streams?.removeChild(streamElement);
      }
    });
  };

  const clearAllVideos = () => {
    const streams = document.querySelector("#streams");
    const streamArr = streams?.querySelectorAll("div");
    streamArr?.forEach((streamElement) => {
      if (streamElement.id !== "myStream") {
        streams?.removeChild(streamElement);
      }
    });
  };

  const clearAllChat = () => {
    const chatBox = chatBoxRef.current;
    const chatArr = chatBox?.querySelectorAll("li");
    chatArr?.forEach((chat) => chatBox?.removeChild(chat));
  };

  const paintModal = (text: string) => {
    const modal = modalRef.current;
    const modalText = modal?.querySelector(".modal__text") as HTMLElement;
    modalText.innerText = text;
    modal?.classList.remove(HIDDEN_CN);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  return (
    <div className="App">
      {!isCall ? (
        <div id="welcome">
          <form onSubmit={handleWelcomeSubmit}>
            <input
              type="text"
              name="roomName"
              value={inputs.roomName}
              onChange={handleInputChange}
              placeholder="Room Name"
              required
            />
            <input
              type="text"
              name="nickname"
              value={inputs.nickname}
              onChange={handleInputChange}
              placeholder="Nickname"
              required
            />
            <button type="submit">Enter</button>
          </form>
        </div>
      ) : (
        <div id="call" className="hidden">
          <div id="streams">
            <div id="myStream">
              <video
                ref={myFaceRef}
                autoPlay
                playsInline
                width="400"
                height="400"
              ></video>
            </div>
            {peerStreams.map((peerStream) => (
              <div key={peerStream.id}>
                <video
                  autoPlay
                  playsInline
                  width="400"
                  height="400"
                  ref={(video) => {
                    if (video) {
                      video.srcObject = peerStream.stream;
                    }
                  }}
                ></video>
                <h3>{peerStream.nickname}</h3>
              </div>
            ))}
          </div>

          <div id="controls">
            <button id="mute" onClick={handleMuteClick}>
              <i className="muteIcon"></i>
              <i className="unMuteIcon hidden"></i>
            </button>
            <button id="camera" onClick={handleCameraClick}>
              <i className="cameraIcon"></i>
              <i className="unCameraIcon hidden"></i>
            </button>
            <select
              id="cameras"
              ref={camerasSelectRef}
              onChange={handleCameraChange}
            ></select>
            <button id="leave" onClick={leaveRoom}>
              Leave
            </button>
          </div>

          <div id="chat">
            <ul id="chatBox" ref={chatBoxRef}></ul>
            <form id="chatForm" onSubmit={handleChatSubmit}>
              <input type="text" placeholder="Type a message" required />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}

      {/* <div className="modal hidden" ref={modalRef}>
        <div className="modal__text"></div>
        <button className="modal__btn" onClick={removeModal}>
          Close
        </button>
      </div> */}
    </div>
  );
};

export default App;
