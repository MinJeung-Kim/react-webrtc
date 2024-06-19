import { ChangeEvent, MouseEvent } from "react";
import { useAtom } from "jotai";
import { Button, CardActions, CardContent, TextField } from "@mui/material";
import { nickNameAtom, roomNameAtom } from "@src/store/VideoAtom";

type Props = {
  setIsCall: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function JoinPage({ setIsCall }: Props) {
  const [roomName, setRoomName] = useAtom(roomNameAtom);
  const [nickName, setNickName] = useAtom(nickNameAtom);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "roomName") setRoomName(value);
    if (name === "nickName") setNickName(value);
  };

  const handleJoinRoom = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (roomName === "" || nickName === "") {
      alert("빈칸을 채워주세요");
      return;
    }
    setIsCall(true);
  };

  return (
    <CardContent>
      <TextField
        name="roomName"
        id="outlined-basic"
        label="Room Name"
        variant="outlined"
        value={roomName}
        onChange={handleChange}
      />
      <TextField
        name="nickName"
        id="outlined-basic"
        label="Your Nickname"
        variant="outlined"
        value={nickName}
        onChange={handleChange}
      />
      <CardActions>
        <Button size="small" onClick={handleJoinRoom}>
          Enter Room
        </Button>
      </CardActions>
    </CardContent>
  );
}
