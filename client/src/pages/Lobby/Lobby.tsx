import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWebRTC } from "@src/hooks/useWebRTC ";
import KeyboardIcon from "@src/components/ui/icons/KeyboardIcon";
import VideoPlayer from "@src/components/VideoPlayer/VideoPlayer";
import CopyInputValue from "@src/components/CopyInputValue/CopyInputValue";
import styles from "./style.module.scss";

export default function LobbyPage() {
  const { localVideoRef, getMedia } = useWebRTC();
  const [room, setRoom] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    getMedia();
  }, []);

  const handleCreateRoom = () => {
    if (room) {
      navigate(`/${room}`);
    }
  };

  return (
    <div className={styles.create_room}>
      <section className={styles.video_wrap}>
        <VideoPlayer videoRef={localVideoRef} />
        <article className={styles.join_wrap}>
          <div className={styles.url_copy}>
            <h1 className={styles.url_title}>Prebuilt Demo</h1>
            <CopyInputValue />
          </div>
          <div className={styles.join_box}>
            <KeyboardIcon />
            <input
              type="text"
              className={styles.join_input}
              placeholder="Enter room name"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />

            <button
              className={styles.join_btn}
              onClick={handleCreateRoom}
              disabled={!room}
            >
              JOIN
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
