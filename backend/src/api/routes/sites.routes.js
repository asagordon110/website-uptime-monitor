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
router.get("/dashboard/stats", getDashboardStats);

// GET /api/sites/:id/checks
router.get("/:id/checks", getCheckHistory);

// GET /api/sites/:id
router.get("/:id", getSiteById);

// POST /api/sites
router.post("/", createSite);

// POST /api/sites/:id/check
router.post("/:id/check", checkSite);

// DELETE /api/sites/:id
router.delete("/:id", deleteSite);

// Export the router 
module.exports = router;