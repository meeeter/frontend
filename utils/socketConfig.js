import io from "socket.io-client";

let socket;

export const initializeSocket = () => {
  if (!socket) {
    socket = io("http://192.168.0.49:3000");
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
