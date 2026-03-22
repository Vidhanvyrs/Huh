// Express server entry point
const express = require("express");
const cors = require("cors");
const config = require("./config/env");

// Routers and Middleware
const explainRouter = require('./routes/explain.route');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use("/api/explain", apiLimiter, explainRouter);

// Basic health route
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Huh? Backend is running" });
});

app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
});