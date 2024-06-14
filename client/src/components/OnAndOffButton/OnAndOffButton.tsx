import { MouseEvent, useState } from "react";
import { Button } from "@mui/material";
import ArrowDownIcon from "../ui/icons/ArrowDownIcon";
import styles from "./style.module.scss";

type Props = {
  icon: JSX.Element;
  options: MediaDeviceInfo[];
  onClick: () => void;
};

export default function OnAndOffButton({ icon, options, onClick }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Button
      id="demo-customized-button"
      aria-controls={open ? "demo-customized-menu" : undefined}
      aria-haspopup="true"
      aria-expanded={open ? "true" : undefined}
      variant="contained"
      disableElevation
      onClick={onClick}
      endIcon={<ArrowDownIcon />}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px",
        background: "rgba(255, 255, 255, 0.2)",
        border: "2px solid rgba(255, 255, 255, 0.2)",
        opacity: 1,
        color: "#fff",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.2)",
        },
      }}
    >
      <i className={styles.icon_wrap}>{icon}</i>
    </Button>
  );
}
