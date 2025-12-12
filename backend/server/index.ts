import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { config } from "dotenv";

// Import routes and services
import apiRoutes from "./routes/api.js";
import { initializeDatabase } from "./config/database.js";
import AIService from "./services/ai-service.js";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==== SECURITY MIDDLEWARE ====
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// AI-specific rate limiting (more restrictive)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 AI requests per minute
  message: {
    error: "AI rate limit exceeded. Please wait before making more AI requests.",
    retryAfter: "1 minute"
  }
});
app.use("/api/ai", aiLimiter);

// ==== CORS CONFIGURATION ====
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "https://eliksir.stefano.app",
    "https://*.stefano.app"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ==== GENERAL MIDDLEWARE ====
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set("trust proxy", 1);

// ==== HEALTH CHECK ====
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "eliksir-stefano-backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB"
    }
  });
});

// ==== ROUTES ====
app.use("/api", apiRoutes);

// ==== ERROR HANDLING ====
// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global error handler:", err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// ==== GRACEFUL SHUTDOWN ====
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Graceful shutdown initiated...`);
  
  // Close server
  if (globalServer) {
    globalServer.close((err) => {
      if (err) {
        console.error("Error during server shutdown:", err);
        process.exit(1);
      }
      
      console.log("✅ Server closed successfully");
      process.exit(0);
    });
  }
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.log("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

// ==== SERVER STARTUP ====
async function startServer() {
  try {
    console.log("🚀 Starting ELIKSIR-STEFANO Backend Server...");
    
    // Initialize database
    console.log("📊 Initializing database connection...");
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      console.error("❌ Failed to initialize database");
      process.exit(1);
    }
    
    console.log("✅ Database initialized successfully");
    
    // Test AI service
    try {
      console.log("🤖 Testing AI service...");
      const aiService = new AIService();
      console.log("✅ AI service initialized successfully");
    } catch (aiError) {
      console.warn("⚠️  AI service initialization failed:", aiError.message);
      console.warn("⚠️  Server will continue without AI features");
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base: http://localhost:${PORT}/api`);
      console.log("==========================================");
      console.log("🍸 ELIKSIR Backend is ready to serve! 🍸");
      console.log("==========================================");
    });
    
    // Graceful shutdown handlers
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    
    return server;
    
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Export for testing
export { app };

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Global server variable
let globalServer: any;

// Start server
startServer().then(s => { 
  globalServer = s; 
  console.log("🚀 Server started successfully!");
});
