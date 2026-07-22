const express = require("express");

const {
  getSites,
  createSite,
  deleteSite,
  checkSite,
  getCheckHistory,
  getSiteById,
  getDashboardStats,
} = require("../controllers/sites.controller");

const {
  createAIAnalysis,
  getLatestAIAnalysis,
} = require("../controllers/ai.controller");

const router = express.Router();

router.get("/", getSites);
router.get("/dashboard/stats", getDashboardStats);
router.get("/:id/checks", getCheckHistory);

router.get(
  "/:id/ai-analysis/latest",
  getLatestAIAnalysis
);

router.post(
  "/:id/ai-analysis",
  createAIAnalysis
);

router.get("/:id", getSiteById);
router.post("/", createSite);
router.post("/:id/check", checkSite);
router.delete("/:id", deleteSite);


module.exports = router;