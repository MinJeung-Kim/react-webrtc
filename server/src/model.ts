export interface User {
  socketId: string;
  nickname: string;
}

export interface Room {
  roomName: string;
  currentNum: number;
  users: User[];
}

export interface TargetRoom {
  roomName: string;
  currentNum: number;
  users: {
    socketId: string;
    nickname: string;
  }[];
}
