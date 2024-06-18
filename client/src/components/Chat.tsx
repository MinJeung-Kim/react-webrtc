import { ChangeEvent, useState } from "react";
import { useAtomValue } from "jotai";
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { nickNameAtom } from "@src/store/VideoAtom";
import SendIcon from "@src/components/ui/icons/SendIcon";

export default function Chat() {
  const nickName = useAtomValue(nickNameAtom);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState("");

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = () => {
    console.log("handleSend");
    setChat(input);
    setInput("");
  };

  return (
    <div className="chat_wrap">
      <List
        className="chat"
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      >
        <ListItem alignItems="flex-start">
          <ListItemAvatar>
            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
          </ListItemAvatar>
          <ListItemText
            primary={nickName}
            secondary={
              <Typography
                sx={{ display: "inline" }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                {chat}
              </Typography>
            }
          />
        </ListItem>
      </List>
      <TextField
        id="standard-textarea"
        placeholder="Write your chat"
        multiline
        variant="standard"
        value={input}
        onChange={handleInput}
      />
      <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend}>
        Send
      </Button>
    </div>
  );
}
