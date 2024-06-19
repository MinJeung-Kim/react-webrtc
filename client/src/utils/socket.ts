import io from "socket.io-client";

const baseURL: string = import.meta.env.VITE_REACT_APP_BASE_URL ?? "";
export const socket = io(baseURL);
