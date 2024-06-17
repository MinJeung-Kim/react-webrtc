import React, { useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import MenuIcon from "../ui/icons/MenuIcon";
import styles from "./style.module.scss";
import { DrawerMenu } from "./DrawerMenu/DrawerMenu";

const iconButtonStyle = {
  height: "100%",
  color: "#fff",
  borderRadius: "8px",
  border: "2px solid rgba(255, 255, 255, 0.2)",
  background: "rgb(33, 32, 50)",
};

export type Anchor = "top" | "left" | "bottom" | "right";

export default function EtcMenus() {
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = useCallback(
    (anchor: Anchor, open: boolean) => () => {
      setState((prevState) => ({ ...prevState, [anchor]: open }));
    },
    []
  );

  return (
    <div className={styles.etc_menus}>
      <IconButton
        aria-label="menu"
        sx={iconButtonStyle}
        onClick={toggleDrawer("bottom", true)}
      >
        <i className={styles.icon}>
          <MenuIcon />
        </i>
      </IconButton>
      <DrawerMenu
        anchor="bottom"
        open={state["bottom"]}
        onClose={toggleDrawer("bottom", false)}
      />
    </div>
  );
}
