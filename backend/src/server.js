// Import express and site routes
const express = require("express");
const cors = require('cors');
const siteRoutes = require("./api/routes/sites.routes");
const cron = require('node-cron');
const { monitorAllSites } = require("./services/monitor.service");

const { checkWebsite } = require("./services/uptime.service");

// db connection pool
const pool = require("./db/pool");

// environment variables
require("dotenv").config();

// Create express app and assign port 
const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

app.use(cors()); // Enable CORS for all routes

// health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// use site routes for all /api/sites endpoints
app.use("/api/sites", siteRoutes);

// Test db connection
async function testDatabaseConnection() {
  try{
    const result = await pool.query("SELECT 1");
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  }
}

testDatabaseConnection();

// Test uptime.server.js
app.get("/test/uptime", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const result = await checkWebsite(url);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to check website uptime" });
  }
});

cron.schedule("* * * * *", async() => {
  console.log("Running scheduled uptime checks...");

  await monitorAllSites();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

