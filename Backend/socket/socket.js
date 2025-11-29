// Backend/socket/socket.js
import { Server } from "socket.io";

let io = null;
const userSocketMap = {}; // userId -> socketId

export const initSocket = (server, allowedOrigins) => {

  const origin =
    process.env.NODE_ENV === "production"
      ? allowedOrigins[0] // In production allow ONLY your Vercel frontend
      : allowedOrigins;   // In dev allow array

  io = new Server(server, {
    cors: {
      origin,
      credentials: true,
    },
    transports: ["websocket", "polling"], // important for vercel
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    console.log("⚡ Socket Connected:", socket.id);

    let userId = socket.handshake.query.userId;

    // Fix: prevent "undefined" userId strings
    if (!userId || userId === "undefined" || userId === "null") {
      console.log("⚠️ Invalid userId sent to socket");
      return;
    }

    userSocketMap[userId] = socket.id;

    // Send online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected:", socket.id);

      if (userId) delete userSocketMap[userId];

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

export const getIO = () => {
  if (!io) {
    console.error("⚠️ Socket.io not initialized!");
    return null;
  }
  return io;
};
