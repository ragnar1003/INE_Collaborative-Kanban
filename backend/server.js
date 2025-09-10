import express from "express";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);


app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync({ alter: true }); 
    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running on port", process.env.PORT || 5000)
    );
  } catch (err) {
    console.error("Failed to start:", err);
  }
};

start();
