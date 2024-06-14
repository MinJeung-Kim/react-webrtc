import { MouseEvent, useState } from "react";
import {
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import CallIcon from "../ui/icons/CallIcon";
import LeaveIcon from "../ui/icons/LeaveIcon";
import MeetingEndIcon from "../ui/icons/MettingEndIcon";
import styles from "./style.module.scss";

const options = [
  { name: "Leave", desc: "Only you will leave the call.", icon: <LeaveIcon /> },
  {
    name: "End",
    desc: "End call for all participants.",
    icon: <MeetingEndIcon />,
  },
];

const ITEM_HEIGHT = 48;
export default function CallButton() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (itemName: string) => {
    setSelectedItem(itemName);
    handleClose();
  };

  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "8px",
          background: "rgb(211, 47, 47)",
          border: "2px solid rgb(211, 47, 47)",
          opacity: 1,
          color: "#fff",
          "&:hover": {
            background: "rgb(211, 47, 47)",
          },
        }}
      >
        <i className={styles.call_icon}>
          <CallIcon />
        </i>
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "auto",
              background: "#212032",
              color: "#fff",
            },
          },
        }}
      >
        {options.map(({ name, desc, icon }) => (
          <MenuItem
            key={name}
            selected={name === selectedItem}
            onClick={() => handleMenuItemClick(name)}
            sx={{
              gap: "1rem",
              "&:hover": {
                backgroundColor: "#333244",
                cursor: "pointer",
              },
            }}
          >
            <ListItemIcon
              sx={{
                background: "rgb(61, 60, 78)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "42px",
                width: "42px",
                borderRadius: "4px",
              }}
            >
              {icon}
            </ListItemIcon>
            <div>
              <Typography variant="inherit" sx={{ fontSize: "14px" }}>
                {name}
              </Typography>
              <Typography
                variant="inherit"
                sx={{ fontSize: "0.9rem", color: "#9fa0a7" }}
              >
                {desc}
              </Typography>
            </div>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
