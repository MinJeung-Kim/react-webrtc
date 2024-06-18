import styles from "./style.module.scss";

type Props = {
  nickName?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
};

export default function VideoPlayer({ videoRef, nickName }: Props) {
  console.log("VideoPlayer : ", videoRef);

  return (
    <div className={styles.video_wrap}>
      {nickName && <h1 className={styles.nick}>닉네임 : {nickName}</h1>}
      <video
        className={styles.local_video}
        ref={videoRef}
        autoPlay
        playsInline
      />
    </div>
  );
}
