import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MenuIcon from "../ui/icons/MenuIcon";
import ChatIcon from "../ui/icons/ChatIcon";
import UsersIcon from "../ui/icons/UsersIcon";
import ScreenShareIcon from "../ui/icons/ScreenShareIcon";
import styles from "./style.module.scss";
import HandIcon from "../ui/icons/HandIcon";

type Anchor = "top" | "left" | "bottom" | "right";

const options = [
  { name: "Chat", icon: <ChatIcon /> },
  { name: "Present Screen", icon: <ScreenShareIcon /> },
  { name: "Participants", icon: <UsersIcon /> },
  { name: "Raise Hand", icon: <HandIcon /> },
];

export default function EtcMenus() {
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };

  const list = (anchor: Anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List
        sx={{
          display: "flex",
          justifyContent: "space-around",
          background: "rgb(33, 32, 50)",
        }}
      >
        {options.map(({ name, icon }) => (
          <Button
            key={name}
            sx={{
              flexDirection: "column",
              "> svg": {
                color: "rgb(149, 149, 158)",
                height: "28px",
                width: "28px",
              },
            }}
          >
            {icon}
            <ListItemText
              primary={name}
              sx={{
                "> span": {
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                  color: "rgb(149, 149, 158)",
                },
              }}
            />
          </Button>
        ))}
      </List>
    </Box>
  );

  return (
    <div className={styles.etc_menus}>
      <IconButton
        aria-label="delete"
        sx={{
          height: "100%",
          color: "#fff",
          borderRadius: "8px",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          background: "rgb(33, 32, 50)",
        }}
        onClick={toggleDrawer("bottom", true)}
      >
        <i className={styles.icon}>
          <MenuIcon />
        </i>
      </IconButton>
      <Drawer
        anchor={"bottom"}
        open={state["bottom"]}
        onClose={toggleDrawer("bottom", false)}
      >
        {list("bottom")}
      </Drawer>
    </div>
  );
}
