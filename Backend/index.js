import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { createServer } from "http";
import { initSocket } from "./socket/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);

// 🚀 PORT
const PORT = process.env.PORT || 5000;

// 🚀 Allowed Origins (Local + Vercel + Render)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL, // your Vercel frontend URL
  process.env.RENDER_EXTERNAL_URL // optional: Render domain
].filter(Boolean);

// 🚀 Important for cookies on Render
app.set("trust proxy", 1);

// 🚀 Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// 🚀 Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// 🚀 Health Check
app.get("/", (req, res) => {
  res.send("Backend is Live ✅");
});

// 🚀 Init Socket.io (WITH CORS)
initSocket(server, allowedOrigins);

// 🚀 Start Server After DB Connected
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
