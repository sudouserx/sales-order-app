require("dotenv-safe").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const compression = require("compression");
const { createLogger, transports, format } = require("winston");
const promBundle = require("express-prom-bundle");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const redis = require("redis");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('trust proxy', true);

// Initialize Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URI,
  enable_offline_queue: false,
});

// Winston logger setup
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/combined.log" }),
    new transports.File({ filename: "logs/errors.log", level: "error" }),
  ],
});

// Prometheus metrics
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  promClient: { collectDefaultMetrics: { timeout: 1000 } },
});

// Rate limiter configuration
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rl_",
  points: parseInt(process.env.API_RATE_LIMIT) || 1000,
  duration: 3600, // 1 hour window
  blockDuration: 600, // Block for 10 minutes if exceeded
});

// middleware stack
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(metricsMiddleware);

// Rate limiting middleware
// app.use(async (req, res, next) => {
//   try {
//     await rateLimiter.consume(req.ip);
//     next();
//   } catch (rlError) {
//     res.status(429).json({
//       error: "Too many requests",
//       message: "Rate limit exceeded",
//     });
//   }
// });

// Database Connection with production settings
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // poolSize: 10,
    // ssl: process.env.NODE_ENV === "production",
    authSource: "admin",
    retryWrites: true,
    w: "majority",
  })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("MongoDB connection error:", err));

// Enhanced Socket.io setup with error handling
io.on("connection", async (socket) => {
  try {
    const token = socket.handshake.query.token;
    if (!token) {
      logger.warn("Socket connection attempt without token");
      return socket.disconnect();
    }

    const decoded = verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select("role username")
      .lean();

    if (!user) {
      logger.warn(`User not found for socket connection: ${decoded.userId}`);
      return socket.disconnect();
    }

    if (user.role === "admin") {
      socket.join("admin");
      logger.info(`Admin connected: ${user.username}`);
      socket.on("error", (err) => {
        logger.error("Socket error:", err);
      });
    }
  } catch (error) {
    logger.error("Socket connection error:", error);
    socket.disconnect();
  }
});

app.locals.io = io;

// Centralized error handling
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      code: statusCode,
      message: statusCode === 500 ? "Internal server error" : err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });
});

// Routes
const authRoutes = require("./routes/auth");
const skuRoutes = require("./routes/sku");
const customerRoutes = require("./routes/customer");
const orderRoutes = require("./routes/order");
const reportRoutes = require("./routes/report");
const healthRoutes = require("./routes/health");

const abilityMiddleware = require("./middleware/ability");
const auth = require("./middleware/auth");
const validate = require("./middleware/validation");

// app.use("/api/auth", validate("auth"), authRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/skus", auth, abilityMiddleware, validate("sku"), skuRoutes);
app.use(
  "/api/customers",
  auth,
  abilityMiddleware,
  validate("customer"),
  customerRoutes
);
app.use("/api/orders", auth, abilityMiddleware, validate("order"), orderRoutes);
app.use("/api/reports", auth, reportRoutes);
app.use("/health", healthRoutes);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Closing server...");
  server.close(() => {
    mongoose.connection.close(false, () => {
      redisClient.quit();
      logger.info("Server closed");
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
