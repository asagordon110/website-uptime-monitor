const pool = require("../../db/pool");

const {
  analyzeIncident,
} = require("../../services/bedrock.service");

/**
 * Calculate objective metrics before involving the AI model.
 *
 * Checks must be ordered newest first.
 */
function buildIncidentEvidence(checks) {
  const responseTimes = checks
    .map((check) => Number(check.response_time_ms))
    .filter(Number.isFinite);

  const upChecks = checks.filter(
    (check) => check.status === "UP"
  ).length;

  const downChecks = checks.filter(
    (check) => check.status === "DOWN"
  ).length;

  let consecutiveDownChecks = 0;

  // Because checks are newest first, stop at the first UP result.
  for (const check of checks) {
    if (check.status !== "DOWN") {
      break;
    }

    consecutiveDownChecks += 1;
  }

  const statusCodeCounts = {};

  for (const check of checks) {
    const key =
      check.status_code === null
        ? "NO_RESPONSE"
        : String(check.status_code);

    statusCodeCounts[key] =
      (statusCodeCounts[key] || 0) + 1;
  }

  const averageResponseTimeMs =
    responseTimes.length > 0
      ? Math.round(
          responseTimes.reduce(
            (total, value) => total + value,
            0
          ) / responseTimes.length
        )
      : null;

  const maxResponseTimeMs =
    responseTimes.length > 0
      ? Math.max(...responseTimes)
      : null;

  const latestCheck = checks[0];

  return {
    analyzedCheckCount: checks.length,
    upChecks,
    downChecks,
    consecutiveDownChecks,
    latestStatus: latestCheck.status,
    latestStatusCode: latestCheck.status_code,
    latestResponseTimeMs:
      latestCheck.response_time_ms,
    latestErrorMessage:
      latestCheck.error_message,
    averageResponseTimeMs,
    maxResponseTimeMs,
    statusCodeCounts,
  };
}

/**
 * POST /api/sites/:id/ai-analysis
 */
async function createAIAnalysis(req, res) {
  const siteId = Number(req.params.id);

  if (!Number.isInteger(siteId) || siteId <= 0) {
    return res.status(400).json({
      error: "A valid site ID is required.",
    });
  }

  try {
    // Confirm that the monitored site exists.
    const siteResult = await pool.query(
      `
        SELECT *
        FROM sites
        WHERE id = $1
      `,
      [siteId]
    );

    if (siteResult.rows.length === 0) {
      return res.status(404).json({
        error: "Site not found.",
      });
    }

    const site = siteResult.rows[0];

    // Retrieve the ten newest checks for incident context.
    const checksResult = await pool.query(
      `
        SELECT *
        FROM checks
        WHERE site_id = $1
        ORDER BY checked_at DESC
        LIMIT 10
      `,
      [siteId]
    );

    const recentChecks = checksResult.rows;

    if (recentChecks.length === 0) {
      return res.status(400).json({
        error:
          "Run at least one uptime check before requesting an AI analysis.",
      });
    }

    const triggerCheck = recentChecks[0];

    // Reuse an analysis if this exact check was already analyzed.
    const cachedResult = await pool.query(
      `
        SELECT *
        FROM incident_analyses
        WHERE site_id = $1
          AND trigger_check_id = $2
        LIMIT 1
      `,
      [siteId, triggerCheck.id]
    );

    if (cachedResult.rows.length > 0) {
      return res.status(200).json({
        message:
          "Existing incident analysis retrieved.",
        cached: true,
        analysis: cachedResult.rows[0],
      });
    }

    // Calculate objective evidence in application code.
    const evidence =
      buildIncidentEvidence(recentChecks);

    // Ask Bedrock to explain and assess that evidence.
    const generatedAnalysis =
      await analyzeIncident({
        site,
        recentChecks,
        evidence,
      });

    // Persist the structured result.
    const insertResult = await pool.query(
      `
        INSERT INTO incident_analyses (
          site_id,
          trigger_check_id,
          summary,
          severity,
          likely_causes,
          recommended_actions,
          evidence,
          confidence,
          model_id
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5::jsonb,
          $6::jsonb,
          $7::jsonb,
          $8,
          $9
        )
        RETURNING *
      `,
      [
        siteId,
        triggerCheck.id,
        generatedAnalysis.summary,
        generatedAnalysis.severity,
        JSON.stringify(
          generatedAnalysis.likelyCauses
        ),
        JSON.stringify(
          generatedAnalysis.recommendedActions
        ),
        JSON.stringify(evidence),
        generatedAnalysis.confidence,
        generatedAnalysis.modelId,
      ]
    );

    return res.status(201).json({
      message:
        "Incident analysis generated successfully.",
      cached: false,
      analysis: insertResult.rows[0],
    });
  } catch (error) {
    console.error(
      "Failed to generate AI incident analysis:",
      error
    );

    return res.status(500).json({
      error:
        "Failed to generate incident analysis.",
    });
  }
}

/**
 * GET /api/sites/:id/ai-analysis/latest
 */
async function getLatestAIAnalysis(req, res) {
  const siteId = Number(req.params.id);

  if (!Number.isInteger(siteId) || siteId <= 0) {
    return res.status(400).json({
      error: "A valid site ID is required.",
    });
  }

  try {
    const result = await pool.query(
      `
        SELECT *
        FROM incident_analyses
        WHERE site_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [siteId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error:
          "No incident analysis exists for this site.",
      });
    }

    return res.status(200).json({
      analysis: result.rows[0],
    });
} catch (error) {
  console.error(
    "Failed to generate AI incident analysis:",
    error
  );

  return res.status(500).json({
    error: "Failed to generate incident analysis.",
    errorName: error.name,
    details: error.message,
    });
  }
}

module.exports = {
  createAIAnalysis,
  getLatestAIAnalysis,
};