// Import Express
const express = require("express");

// Create Express app
const app = express();

// Set server port
const PORT = 3000;

// Allow Express to read JSON request bodies
app.use(express.json());

// Temporary in-memory database
let sites = [];

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Get all monitored websites
app.get("/sites", (req, res) => {
  res.json({
    sites: sites
  });
});

// Add a new website to monitor
app.post("/sites", (req, res) => {
  const { name, url } = req.body;

  // Validate input
  if (!name || !url) {
    return res.status(400).json({
      error: "Name and URL are required"
    });
  }

  // Check if the site already exists
  const existingSite = sites.find((site) => site.url === url);

  if (existingSite) {
    return res.status(409).json({
      error: "Site already exists"
    });
  }

  // Create a new site object
  const newSite = {
    id: Date.now(),
    name: name,
    url: url,
    status: "unknown"
  };

  // Save site
  sites.push(newSite);

  // Return created site
  res.status(201).json({
    message: "Site added successfully",
    site: newSite
  });
});

// Delete a website by id
app.delete("/sites/:id", (req, res) => {
  const id = Number(req.params.id);

  const siteExists = sites.find((site) => site.id === id);

  if (!siteExists) {
    return res.status(404).json({
      error: "Site not found"
    });
  }

  sites = sites.filter((site) => site.id !== id);

  res.status(200).json({
    message: "Site deleted successfully"
  });
});

// Update the status of a website
app.post("/sites/:id/status", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  // Validate status
  if (!status || !["up", "down"].includes(status)) {
    return res.status(400).json({
      error: "Status must be either 'up' or 'down'"
    });
  }

  // Find site
  const site = sites.find((site) => site.id === id);

  if (!site) {
    return res.status(404).json({
      error: "Site not found"
    });
  }

  // Update site status
  site.status = status;

  res.status(200).json({
    message: "Status updated successfully",
    site: site
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});