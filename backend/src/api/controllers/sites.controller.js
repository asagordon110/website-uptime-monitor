const pool = require("../../db/pool");
const { checkWebsite } = require("../../services/uptime.service");

// Function to display sites and status
async function getSites(req, res) {
    try {

    // Query to show sites
    const result = await pool.query(
        `SELECT * FROM sites ORDER BY created_at DESC` // Select all from sites table in the order they were created_at starting with most recent
    );

    res.status(200).json({
        sites: result.rows
    });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get sites."
        });
    }
}

// Function to create/add a site
async function createSite(req, res){
    const { name, url } = req.body;

    // validate input
    if (!name || !url){
        return res.status(400).json({
            error: "Name and URL are required."
        });
    }

    // Query database to add name and url to sites table
    try {
        const result = await pool.query(
            `INSERT INTO sites (name, url)
            VALUES ($1, $2)
            RETURNING *`,
            [name, url]
        );

        res.status(201).json({
            message: "Site added successfully",
            site: result.rows[0]
        });
    } catch (error) {
        console.error(error);

        // Handle duplicate sites
        if (error.code === "23505") {   // 23505 = duplicate unique values error code in Postgres
            return res.status(409).json({   // 409 = request conflicts w/ existing data
                error: "Site already exists."
            });
        }

        res.status(500).json({
            error: "Failed to add site."
        });
    }
}

// Function to delete site
async function deleteSite(req, res){
    const id = Number(req.params.id);

    // Query to delete site based on their id 
    try {
        const result = await pool.query(
            `DELETE FROM sites
            WHERE id = $1
            RETURNING *`,
            [id]
        );
        
        // If site does not exist/not found, return not found error
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Site not found."
            });
        }

        res.status(200).json({
        message: "Site deleted successfully",
        site: result.rows[0]
    });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to delete site."
        });

    }
}

// Function to check site uptime
async function checkSite(req, res) {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            `SELECT * FROM sites WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Site not found."
            });
        }

        const site = result.rows[0];

        const uptimeResult = await checkWebsite(site.url);

        const checkInsert = await pool.query(
            `INSERT INTO checks (
                site_id,
                status,
                status_code,
                response_time_ms,
                error_message
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                site.id,
                uptimeResult.status,
                uptimeResult.statusCode,
                uptimeResult.responseTimeMs,
                uptimeResult.errorMessage
            ]
        );

        const updatedSite = await pool.query(
            `UPDATE sites
            SET current_status = $1,
                last_checked_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *`,
            [uptimeResult.status, site.id]
        );

        res.status(200).json({
            message: "Site checked successfully",
            site: updatedSite.rows[0],
            check: checkInsert.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to check site."
        });
    }
}

// Function to get check history for a site
async function getCheckHistory(req, res) {
    const id = Number(req.params.id);

    try {
        const siteResult = await pool.query(
            `SELECT * FROM sites WHERE id = $1`,
            [id]
        );

        if (siteResult.rows.length === 0) {
            return res.status(404).json({
                error: "Site not found."
            }); 
        }

        const checksResult = await pool.query(
            `SELECT * FROM checks WHERE site_id = $1 
            ORDER BY checked_at DESC`,
            [id]
        );
        res.status(200).json({
            message: "Check history retrieved successfully",
            site: siteResult.rows[0],
            checks: checksResult.rows
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get check history."
        });
    }
}

async function getSiteById(req, res) {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            `SELECT * FROM sites WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Site not found."
            });
        }

        res.status(200).json({
            site: result.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get site."
        });
    }
}

// function for dashboard endpoint to get all sites with their latest check status
async function getDashboardStats(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                COUNT(*) AS total_sites,
                COUNT(*) FILTER (WHERE current_status = 'UP') AS sites_up,
                COUNT(*) FILTER (WHERE current_status = 'DOWN') AS sites_down,
                COUNT(*) FILTER (WHERE current_status = 'PENDING') AS sites_pending
            FROM sites
        `);

        const totalChecks = await pool.query(`
            SELECT COUNT(*) AS total_checks FROM checks
        `);

        res.status(200).json({
            totalSites: Number(result.rows[0].total_sites),
            sitesUp: Number(result.rows[0].sites_up),
            sitesDown: Number(result.rows[0].sites_down),
            sitesPending: Number(result.rows[0].sites_pending),
            totalChecks: Number(totalChecks.rows[0].total_checks)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to get dashboard stats."
        });
    }
}

module.exports = {
    getSites,
    createSite,
    deleteSite,
    checkSite,
    getCheckHistory,
    getSiteById,
    getDashboardStats
};