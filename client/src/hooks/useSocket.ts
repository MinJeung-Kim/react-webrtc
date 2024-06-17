import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface SocketEvent {
  event: string;
  handler: (...args: any[]) => void;
}

const useSocket = (socket: Socket, events: SocketEvent[]) => {
  useEffect(() => {
    events.forEach(({ event, handler }) => {
      socket.on(event, handler);
    });

    return () => {
      events.forEach(({ event, handler }) => {
        socket.off(event, handler);
      });
    };
  }, [socket, events]);
};

export default useSocket;
