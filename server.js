// server.js
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const port = process.env.PORT || 3000;
const path = require("path");

// --- DB ---
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}`);
});

// --- CORS (single, correct config) ---
const allowedOrigins = [
  "http://localhost:5173",
  'https://spareeye.onrender.com'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Body parsing ---
app.use(express.json({ limit: "1mb" }));

// --- Static for uploaded images ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routers ---
const testJwtRouter = require("./controllers/test-jwt");
const authRouter = require("./controllers/auth");
const userRouter = require("./controllers/users");
const requestRouter = require("./controllers/requests");
const settingRouter = require("./controllers/settings");

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/requests", requestRouter);
app.use("/test-jwt", testJwtRouter);
app.use("/settings", settingRouter);

// --- Start ---
app.listen(port, () => {
  console.log(`The Server is running on port ${port}`);
});