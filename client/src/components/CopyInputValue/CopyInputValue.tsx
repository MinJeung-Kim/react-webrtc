import { useRef, useState } from "react";
import CopyIcon from "../ui/icons/CopyIcon";
import CheckmarkIcon from "../ui/icons/CheckmarkIcon";
import styles from "./style.module.scss";

export default function CopyInputValue() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCopy, setIsCopy] = useState(false);

  const handleCopyToClipboard = () => {
    const inputValue = inputRef.current?.value;

    if (inputValue) {
      navigator.clipboard
        .writeText(inputValue) // 클립보드에 텍스트 복사
        .then(() => {
          setIsCopy(true);
          setTimeout(() => setIsCopy(false), 3000);
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <div className={styles.url_wrap}>
      <input
        className={styles.url_input}
        ref={inputRef}
        type="text"
        readOnly
        value="https://www.videosdk.live/prebuilt/demo"
      />
      {isCopy ? (
        <i className={styles.check_icon}>
          <CheckmarkIcon />
        </i>
      ) : (
        <i className={styles.copy_icon} onClick={handleCopyToClipboard}>
          <CopyIcon />
        </i>
      )}
    </div>
  );
}
