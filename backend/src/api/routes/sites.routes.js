const express = require("express");


// Import functions from sites controller
const {
    getSites,
    createSite,
    deleteSite,
    checkSite,
    getCheckHistory,
    getSiteById,
    getDashboardStats
} = require("../controllers/sites.controller");

// Use express router
const router = express.Router();

// GET /api/sites
router.get("/", getSites);

// GET /api/sites/dashboard/stats
// Data for dashboard
router.get("/dashboard/stats", getDashboardStats);

// GET /api/sites/:id/checks
// Check history for a website
router.get("/:id/checks", getCheckHistory);

// GET /api/sites/:id
// Find site by id
router.get("/:id", getSiteById);

// POST /api/sites
// Add site to monitor
router.post("/", createSite);

// POST /api/sites/:id/check
// Check 1 website
router.post("/:id/check", checkSite);

// DELETE /api/sites/:id
router.delete("/:id", deleteSite);

// Export the router 
module.exports = router;