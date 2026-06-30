const express = require("express");

// Import functions from sites controller
const {
    getSites,
    createSite,
    deleteSite
} = require("../controllers/sites.controller");

// Use express router
const router = express.Router();

// GET /api/sites - Get all sites
router.get("/", getSites);

// POST /api/sites - Create a new site
router.post("/", createSite);

// DELETE /api/sites/:id - Delete a site by ID
router.delete("/:id", deleteSite);

// Export the router 
module.exports = router;