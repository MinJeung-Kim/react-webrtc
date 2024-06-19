import { ChangeEvent, useState } from "react";
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
import SendIcon from "@src/components/ui/icons/SendIcon";

type Props = {
  chats: {
    text: string;
    nickname: string;
  }[];
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        text: string;
        nickname: string;
      }[]
    >
  >;
};

export default function Chat({ chats, setChats }: Props) {
  const [input, setInput] = useState("");

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSend = () => {
    console.log("handleSend");
    setInput("");
  };

  console.log("Chat : ", chats);
  return (
    <div className="chat_wrap">
      <List
        className="chat"
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
      >
        {chats.map(({ text, nickname }, index) => (
          <ListItem key={index} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
            </ListItemAvatar>
            <ListItemText
              primary={nickname}
              secondary={
                <Typography
                  sx={{ display: "inline" }}
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {text}
                </Typography>
              }
            />
          </ListItem>
        ))}
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
