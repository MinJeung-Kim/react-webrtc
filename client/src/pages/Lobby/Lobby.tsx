import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./style.module.scss";

export default function LobbyPage() {
  const [room, setRoom] = useState<string>("");
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (room) {
      navigate(`/${room}`);
    }
  };

  return (
    <div className={styles.create_room}>
      <input
        className={styles.room_name}
        type="text"
        placeholder="Enter room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={handleCreateRoom} disabled={!room}>
        Create Room
      </button>
    </div>
  );
}
