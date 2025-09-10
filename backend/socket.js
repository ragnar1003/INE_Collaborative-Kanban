import {
  setUserOnline,
  setUserOffline,
  getOnlineUsers,
  setTyping,
  clearTyping,
  getTypingUsers
} from "./utils/presence.js";

// In your socket.io connection handler:
io.on("connection", (socket) => {
  socket.on("joinBoard", async (boardId, userId) => {
    await setUserOnline(boardId, userId);
    const online = await getOnlineUsers(boardId);
    io.to(boardId).emit("presenceUpdate", online);
    socket.join(boardId);
  });

  socket.on("leaveBoard", async (boardId, userId) => {
    await setUserOffline(boardId, userId);
    const online = await getOnlineUsers(boardId);
    io.to(boardId).emit("presenceUpdate", online);
    socket.leave(boardId);
  });

  socket.on("typing", async (boardId, userId) => {
    await setTyping(boardId, userId);
    const typing = await getTypingUsers(boardId);
    io.to(boardId).emit("typingUpdate", typing);
  });

  socket.on("stopTyping", async (boardId, userId) => {
    await clearTyping(boardId, userId);
    const typing = await getTypingUsers(boardId);
    io.to(boardId).emit("typingUpdate", typing);
  });

  socket.on("disconnecting", async () => {
    // Optionally clean up presence/typing for all boards the user was in
  });
});