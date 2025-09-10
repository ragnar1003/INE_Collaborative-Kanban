
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { sequelize } from "./model/index.js";
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/board.js";
import columnRoutes from "./routes/column.js";
import { setUserOnline, setUserOffline, getOnlineUsers, setTyping, clearTyping, getTypingUsers } from "./utils/presence.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});




import cardRoutes from "./routes/card.js";
app.use("/boards", boardRoutes);
app.use("/columns", columnRoutes);
app.use("/cards", cardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

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
    // This can be implemented if needed
  });
});

// ...existing code...

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// setupWebSockets(io); // Removed: not defined and not needed

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync({ alter: true });
    const port = process.env.PORT || 5000;
    server.listen(port, () =>
      console.log(`Server running on port ${port}`)
    );
  } catch (err) {
    console.error("Failed to start:", err);
  }
};

start();