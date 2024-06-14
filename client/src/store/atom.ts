import { atom } from "jotai";

export const roomNameAtom = atom("");
export const cameraOptionAtom = atom<MediaDeviceInfo[]>([]);
export const audioOptionAtom = atom<MediaDeviceInfo[]>([]);
export const isMutedAtom = atom(false);
export const cameraOffAtom = atom(false);
export const myStreamAtom = atom<MediaStream | null>(null);
