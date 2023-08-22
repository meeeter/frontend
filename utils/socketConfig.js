import io from "socket.io-client";

let socket;
const serverURL = process.env.EXPO_PUBLIC_SERVER_URL;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(serverURL);
  }
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }

  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
