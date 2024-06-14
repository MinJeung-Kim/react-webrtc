import styles from "./style.module.scss";

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
};

export default function VideoPlayer({ videoRef }: Props) {
  return (
    <video className={styles.local_video} ref={videoRef} autoPlay playsInline />
  );
}
