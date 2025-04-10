require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./routes/auth/auth-routes");
const bookRoutes = require("./routes/book/book-routes");
const uploadRoutes = require("./routes/user/user-routes"); // ✅ renamed

const app = express();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/books", bookRoutes);
app.use("/api/user", uploadRoutes);

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
