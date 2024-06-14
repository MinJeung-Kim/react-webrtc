import { MouseEvent, useState } from "react";
import {
  Button,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import CheckmarkIcon from "../ui/icons/CheckmarkIcon";
import ArrowDownIcon from "../ui/icons/ArrowDownIcon";
import styles from "./style.module.scss";

type Props = {
  icon: JSX.Element;
  options: MediaDeviceInfo[];
  onClick: () => void;
};

const ITEM_HEIGHT = 48;
export default function OnAndOffButton({ icon, options, onClick }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLable, setSelectedLable] = useState(options[0]?.label);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (label: string) => {
    setSelectedLable(label);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={styles.button_wrap}>
      <IconButton aria-label="delete" sx={{ color: "#fff" }} onClick={onClick}>
        {icon}
      </IconButton>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        endIcon={<ArrowDownIcon />}
        sx={{
          minWidth: "30px",
          padding: 0,
          border: "none",
          background: "transparent",
          color: "#fff",
          "&:hover": {
            background: "transparent",
          },
          "> span": {
            margin: 0,
          },
        }}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        slotProps={{
          paper: {
            style: {
              maxHeight: ITEM_HEIGHT * 4.5,
              width: "auto",
              background: "#333244",
              color: "#fff",
            },
          },
        }}
      >
        {options.map(({ deviceId, label }) => (
          <MenuItem
            key={deviceId}
            selected={label === selectedLable}
            onClick={() => handleMenuItemClick(label)}
            sx={{
              "&:hover": { background: "rgb(109, 110, 113)" },
            }}
          >
            <ListItemIcon>
              {selectedLable === label && (
                <i className={styles.check_icon}>
                  <CheckmarkIcon />
                </i>
              )}
            </ListItemIcon>

            {label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
