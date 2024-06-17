import { Box, Button, Drawer, List, ListItemText } from "@mui/material";
import { Anchor } from "../EtcMenus";
import ChatIcon from "../../ui/icons/ChatIcon";
import HandIcon from "../../ui/icons/HandIcon";
import UsersIcon from "../../ui/icons/UsersIcon";
import ScreenShareIcon from "../../ui/icons/ScreenShareIcon";
import { drawerListStyle, listItemTextStyle, menuButtonStyle } from "./styles";

type Props = {
  anchor: Anchor;
  open: boolean;
  onClose: () => void;
};

const options = [
  { name: "Chat", icon: <ChatIcon /> },
  { name: "Present Screen", icon: <ScreenShareIcon /> },
  { name: "Participants", icon: <UsersIcon /> },
  { name: "Raise Hand", icon: <HandIcon /> },
];

export const DrawerMenu = ({ anchor, open, onClose }: Props) => (
  <Drawer anchor={anchor} open={open} onClose={onClose}>
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
      onClick={onClose}
      onKeyDown={onClose}
    >
      <List sx={drawerListStyle}>
        {options.map(({ name, icon }) => (
          <Button key={name} sx={menuButtonStyle}>
            {icon}
            <ListItemText primary={name} sx={listItemTextStyle} />
          </Button>
        ))}
      </List>
    </Box>
  </Drawer>
);
