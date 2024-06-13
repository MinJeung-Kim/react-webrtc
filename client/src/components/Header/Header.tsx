import { memo } from "react";
import styles from "./style.module.scss";

type Props = {
  username: string;
  onLogout: () => void;
};
export const Header = memo(({ username, onLogout }: Props) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1 className={styles.logo_name}>WebRTC</h1>
        {username && <span className={styles.logo_user}>@{username}</span>}
      </div>
      {username && (
        <nav className={styles.menu}>
          <button className={styles.menu_item} onClick={onLogout}>
            Logout
          </button>
        </nav>
      )}
    </header>
  );
});
