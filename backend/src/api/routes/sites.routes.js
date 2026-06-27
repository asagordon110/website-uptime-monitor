const express = require("express");

const {
    getSites,
    createSite,
    deleteSite,
    updateSiteStatus
} = require("../controllers/sites.controller");

const router = express.Router();

// GET /api/sites - Get all sites
router.get("/", getSites);

// POST /api/sites - Create a new site
router.post("/", createSite);

// DELETE /api/sites/:id - Delete a site by ID
router.delete("/:id", deleteSite);

// POST /api/sites/:id/status - Update site status
router.post("/:id/status", updateSiteStatus);

// Export the router
module.exports = router;