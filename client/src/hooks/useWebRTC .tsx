import { useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  audioOptionAtom,
  cameraOptionAtom,
  myStreamAtom,
} from "@src/store/atom";

export const useWebRTC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null); // 로컬 비디오 요소에 대한 참조
  const remoteVideoRef = useRef<HTMLVideoElement>(null); // 원격 비디오 요소에 대한 참조
  const peerConnection = useRef<RTCPeerConnection | null>(null); // 피어 연결 객체에 대한 참조
  const [cameraOptions, setCameraOptions] = useAtom(cameraOptionAtom);
  const [audioOptions, setAudioOptions] = useAtom(audioOptionAtom);
  const setMyStream = useSetAtom(myStreamAtom);

  // 피어 연결을 초기화하는 함수
  const initializePeerConnection = (
    handleNewICECandidate: (candidate: RTCIceCandidateInit) => void,
    handleTrackEvent: (event: RTCTrackEvent) => void
  ) => {
    // 피어 연결 객체 생성 및 ICE 서버 설정
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // STUN 서버
        {
          urls: "turn:localhost:3478", // TURN 서버
          username: "coturn", // TURN 서버 사용자명
          credential: "admin", // TURN 서버 비밀번호
        },
      ],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // 새로운 ICE 후보를 처리하는 함수 호출
        handleNewICECandidate(event.candidate.toJSON());
      }
    };

    // 새로운 트랙이 추가되었을 때 호출되는 핸들러
    peerConnection.current.ontrack = handleTrackEvent;
  };

  // 오퍼를 생성하는 함수
  const createOffer = async () => {
    if (!peerConnection.current) return null; // 피어 연결이 없으면 종료
    const offer = await peerConnection.current.createOffer(); // 오퍼 생성
    await peerConnection.current.setLocalDescription(offer); // 로컬 설명 설정
    return peerConnection.current.localDescription; // 로컬 설명 반환
  };

  // 응답을 생성하는 함수
  const createAnswer = async () => {
    if (!peerConnection.current) return null; // 피어 연결이 없으면 종료
    const answer = await peerConnection.current.createAnswer(); // 응답 생성
    await peerConnection.current.setLocalDescription(answer); // 로컬 설명 설정
    return peerConnection.current.localDescription; // 로컬 설명 반환
  };

  // 원격 설명을 설정하는 함수
  const setRemoteDescription = async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return; // 피어 연결이 없으면 종료
    const desc = new RTCSessionDescription(sdp); // SDP를 사용해 설명 객체 생성
    await peerConnection.current.setRemoteDescription(desc); // 원격 설명 설정
  };

  // ICE 후보를 추가하는 함수
  const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return; // 피어 연결이 없으면 종료
    const iceCandidate = new RTCIceCandidate(candidate); // ICE 후보 객체 생성
    await peerConnection.current.addIceCandidate(iceCandidate); // ICE 후보 추가
  };

  // 사용자의 미디어 스트림을 가져오는 함수
  // const getUserMedia = async () => {
  //   // 비디오와 오디오 스트림 요청
  //   const stream = await navigator.mediaDevices.getUserMedia({
  //     video: true,
  //     audio: true,
  //   });

  //   if (localVideoRef.current) {
  //     // 로컬 비디오 요소에 스트림 설정
  //     localVideoRef.current.srcObject = stream;
  //   }
  //   stream.getTracks().forEach((track) => {
  //     peerConnection.current?.addTrack(track, stream); // 각 트랙을 피어 연결에 추가
  //   });
  //   return stream;
  // };

  const getCameras = async () => {
    // user 장치 리스트 가져오기
    const devices = await navigator.mediaDevices.enumerateDevices();

    // 여러 내장 장치 중 카메라만 가져오기
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const audios = devices.filter((device) => device.kind === "audioinput");

    setCameraOptions(cameras);
    setAudioOptions(audios);
  };

  const getMedia = async (deviceId?: string) => {
    const initialConstrains = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstrains = {
      audio: true,
      video: { deviceId: { exact: deviceId } },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        deviceId ? cameraConstrains : initialConstrains
      );
      setMyStream(stream);
      if (localVideoRef.current) {
        // 로컬 비디오 요소에 스트림 설정
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream); // 각 트랙을 피어 연결에 추가
      });

      if (!deviceId) {
        await getCameras();
      }
      return stream;
    } catch (err) {
      console.error(err);
    }
  };

  return {
    localVideoRef,
    remoteVideoRef,
    cameraOptions,
    audioOptions,
    initializePeerConnection,
    peerConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    // getUserMedia,
    getMedia,
  };
};
