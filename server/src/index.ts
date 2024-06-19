import express from "express";
import http from "http";
import cors from "cors";
import { Server, Socket } from "socket.io";

const app = express();
app.use(cors);
const port = 8080;
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

interface User {
  socketId: string;
  nickname: string;
}

interface Room {
  roomName: string;
  currentNum: number;
  users: User[];
}

let roomObjArr: Room[] = []; // 방 정보 배열 초기화
const MAXIMUM = 5; // 최대 인원 설정

wsServer.on("connection", (socket: Socket) => {
  // 클라이언트가 연결되었을 때 실행
  let myRoomName: string | null = null; // 클라이언트의 방 이름 변수
  let myNickname: string | null = null; // 클라이언트의 닉네임 변수

  socket.on("join_room", (roomName: string, nickname: string) => {
    // 클라이언트가 방에 참가할 때
    myRoomName = roomName; // 방 이름 설정
    myNickname = nickname; // 닉네임 설정

    let isRoomExist = false; // 방 존재 여부 변수
    let targetRoomObj: Room | null = null; // 타겟 방 객체 변수

    for (let i = 0; i < roomObjArr.length; ++i) {
      // 모든 방을 확인
      if (roomObjArr[i].roomName === roomName) {
        // 방 이름이 일치하면
        if (roomObjArr[i].currentNum >= MAXIMUM) {
          // 방 인원이 최대치에 도달했으면
          socket.emit("reject_join"); // 참가 거부 이벤트 전송
          return; // 함수 종료
        }

        isRoomExist = true; // 방이 존재함
        targetRoomObj = roomObjArr[i]; // 타겟 방 객체 설정
        break; // 루프 종료
      }
    }

    if (!isRoomExist) {
      // 방이 존재하지 않으면
      targetRoomObj = {
        roomName,
        currentNum: 0,
        users: [],
      }; // 새로운 방 객체 생성
      roomObjArr.push(targetRoomObj); // 방 배열에 추가
    }

    targetRoomObj?.users.push({
      socketId: socket.id,
      nickname,
    }); // 방 객체에 사용자 추가
    if (targetRoomObj) {
      ++targetRoomObj.currentNum; // 현재 인원 수 증가
      console.log("accept_join : ", targetRoomObj);

      socket.join(roomName); // 클라이언트를 방에 참가시킴
      socket.emit("accept_join", targetRoomObj?.users); // 참가 수락 이벤트 전송
    }
  });

  socket.on(
    "offer",
    (
      offer: RTCSessionDescriptionInit,
      remoteSocketId: string,
      localNickname: string
    ) => {
      // 클라이언트가 offer 이벤트를 보냈을 때
      socket.to(remoteSocketId).emit("offer", offer, socket.id, localNickname); // 대상 클라이언트에 offer 이벤트 전달
    }
  );

  socket.on(
    "answer",
    (answer: RTCSessionDescriptionInit, remoteSocketId: string) => {
      // 클라이언트가 answer 이벤트를 보냈을 때
      socket.to(remoteSocketId).emit("answer", answer, socket.id); // 대상 클라이언트에 answer 이벤트 전달
    }
  );

  socket.on("ice", (ice: RTCIceCandidate, remoteSocketId: string) => {
    // 클라이언트가 ice 이벤트를 보냈을 때
    socket.to(remoteSocketId).emit("ice", ice, socket.id); // 대상 클라이언트에 ice 이벤트 전달
  });

  socket.on("chat", (message: string, roomName: string) => {
    // 클라이언트가 채팅 메시지를 보냈을 때
    socket.to(roomName).emit("chat", message); // 같은 방에 있는 다른 클라이언트에 메시지 전달
  });

  socket.on("disconnecting", () => {
    // 클라이언트가 연결을 끊기 직전에 실행
    if (myRoomName && myNickname) {
      socket.to(myRoomName).emit("leave_room", socket.id, myNickname); // 같은 방에 있는 다른 클라이언트에 떠난다는 이벤트 전달

      let isRoomEmpty = false; // 방이 비었는지 여부 변수
      for (let i = 0; i < roomObjArr.length; ++i) {
        // 모든 방을 확인
        if (roomObjArr[i].roomName === myRoomName) {
          // 방 이름이 일치하면
          const newUsers = roomObjArr[i].users.filter(
            (user) => user.socketId != socket.id
          ); // 떠난 사용자를 제외한 새로운 사용자 배열 생성
          roomObjArr[i].users = newUsers; // 사용자 배열 업데이트
          --roomObjArr[i].currentNum; // 현재 인원 수 감소

          if (roomObjArr[i].currentNum === 0) {
            isRoomEmpty = true; // 방이 비었음을 표시
          }
        }
      }

      if (isRoomEmpty) {
        // 방이 비었으면
        roomObjArr = roomObjArr.filter((roomObj) => roomObj.currentNum != 0); // 비어있지 않은 방들만 남기기
      }
    }
  });
});
httpServer.listen(port, () => {
  console.log("server started on port 8080");
});
