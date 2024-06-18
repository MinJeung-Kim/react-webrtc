import { useAtomValue } from "jotai";
import { roomNameAtom } from "@src/store/atom";
import styles from "./style.module.scss";

export default function RoomHeader() {
  const room = useAtomValue(roomNameAtom);
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>Room Name : {room}</h1>
      <span className={styles.peer_count}>2명</span>
    </div>
  );
}
