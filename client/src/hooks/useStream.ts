import { useState, useCallback } from "react";

const useStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOptions, setCameraOptions] = useState<MediaDeviceInfo[]>([]);
  const [audioOptions, setAudioOptions] = useState<MediaDeviceInfo[]>([]);

  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices(); // 모든 미디어 장치 가져오기
      const cameras = devices.filter((device) => device.kind === "videoinput"); // 비디오 입력 장치 필터링
      setCameraOptions(cameras);

      const audios = devices.filter((device) => device.kind === "audioinput");
      setAudioOptions(audios);
    } catch (error) {
      console.log(error); // 오류 출력
    }
  }, []);

  const getMedia = useCallback(async (deviceId?: string) => {
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
      setStream(stream);

      if (!deviceId) {
        // deviceId가 없을 때, 즉 초기 실행일 때
        stream //
          .getAudioTracks()
          .forEach((track) => (track.enabled = false)); // 오디오 트랙 음소거

        await getCameras(); // 카메라 목록 가져오기
      }

      return stream;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  return {
    stream,
    cameraOptions,
    audioOptions,
    getMedia,
  };
};

export default useStream;
