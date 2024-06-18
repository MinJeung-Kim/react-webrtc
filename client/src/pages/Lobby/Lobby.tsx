import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useWebRTC } from "@src/hooks/useWebRTC ";
import UserIcon from "@src/components/ui/icons/UserIcon";
import KeyboardIcon from "@src/components/ui/icons/KeyboardIcon";
import VideoPlayer from "@src/components/VideoPlayer/VideoPlayer";
import CopyInputValue from "@src/components/CopyInputValue/CopyInputValue";
import { nickNameAtom, roomNameAtom } from "@src/store/atom";
import styles from "./style.module.scss";

export default function LobbyPage() {
  const { localVideoRef, getMedia } = useWebRTC();
  const [nick, setNick] = useAtom(nickNameAtom);
  const [room, setRoom] = useAtom(roomNameAtom);
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
            <div className={styles.name}>
              <UserIcon />
              <input
                type="text"
                className={styles.join_input}
                placeholder="Enter nick name"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
              />
            </div>
            <div className={styles.name}>
              <KeyboardIcon />
              <input
                type="text"
                className={styles.join_input}
                placeholder="Enter room name"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
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
