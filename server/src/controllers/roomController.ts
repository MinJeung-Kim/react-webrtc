interface User {
  socketId: string;
  nickname: string;
}

interface Room {
  roomName: string;
  currentNum: number;
  users: User[];
}

let roomObjArr: Room[] = [];
const MAXIMUM = 5;

export const findRoom = (roomName: string): Room | null => {
  return roomObjArr.find((room) => room.roomName === roomName) || null;
};

export const addUserToRoom = (
  roomName: string,
  socketId: string,
  nickname: string
): Room | null => {
  let targetRoomObj = findRoom(roomName);

  if (targetRoomObj) {
    if (targetRoomObj.currentNum >= MAXIMUM) {
      return null;
    }
  } else {
    targetRoomObj = { roomName, currentNum: 0, users: [] };
    roomObjArr.push(targetRoomObj);
  }

  targetRoomObj.users.push({ socketId, nickname });
  targetRoomObj.currentNum++;

  return targetRoomObj;
};

export const removeUserFromRoom = (socketId: string, room: Room): void => {
  room.users = room.users.filter((user) => user.socketId !== socketId);
  room.currentNum--;

  if (room.currentNum === 0) {
    roomObjArr = roomObjArr.filter((r) => r.roomName !== room.roomName);
  }
};
