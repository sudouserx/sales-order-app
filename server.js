require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const { verify } = require("jsonwebtoken");
const User = require("./models/User");

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io setup
io.on("connection", async (socket) => {
  try {
    const token = socket.handshake.query.token;
    if (!token) return socket.disconnect();

    const decoded = verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return socket.disconnect();

    // Join admin room if user is admin
    if (user.role === "admin") {
      socket.join("admin");
      console.log(`Admin ${user.username} connected`);
    }
  } catch (error) {
    socket.disconnect();
  }
});

app.locals.io = io;

// Routes
const authRoutes = require("./routes/auth");
const skuRoutes = require("./routes/sku");
const customerRoutes = require("./routes/customer");
const orderRoutes = require("./routes/order");
const reportRoutes = require("./routes/report");

const abilityMiddleware = require("./middleware/ability");
const auth = require("./middleware/auth");

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/skus", auth, abilityMiddleware, skuRoutes);
app.use("/api/customers", auth, abilityMiddleware, customerRoutes);
app.use("/api/orders", auth, abilityMiddleware, orderRoutes);

// Cron Job
const setupCron = require("./cron");
setupCron();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
