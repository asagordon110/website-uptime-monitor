// Import express and site routes
const express = require("express");
const siteRoutes = require("./api/routes/sites.routes");

// Create express app and assign port 
const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// use site routes for all /api/sites endpoints
app.use("/api/sites", siteRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
