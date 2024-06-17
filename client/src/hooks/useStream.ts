import { useState, useCallback } from "react";

const useStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

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
      return stream;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  return { stream, getMedia };
};

export default useStream;
