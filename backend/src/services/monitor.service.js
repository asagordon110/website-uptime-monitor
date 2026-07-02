const { checkWebsite } = require("./uptime.service");
const pool = require("../db/pool");

// Function to monitor all sites
async function monitorAllSites() {
    try {
        // Fetch all sites from the database
        const result = await pool.query("SELECT * FROM sites");
        const sites = result.rows;

        for (const site of sites) {
            try {
                // Check the uptime of each site
                const uptimeResult = await checkWebsite(site.url);
                await pool.query(
                    `INSERT INTO checks (
                        site_id,
                        status,
                        status_code,
                        response_time_ms,
                        error_message
                    )
                    VALUES ($1, $2, $3, $4, $5)`,
                    [
                        site.id,
                        uptimeResult.status,
                        uptimeResult.statusCode,
                        uptimeResult.responseTimeMs,
                        uptimeResult.errorMessage
                    ]
                );

                await pool.query(
                    `UPDATE sites
                    SET current_status = $1
                    WHERE id = $2`,
                    [uptimeResult.status, site.id]
                );

                console.log(
                    `${site.name} checked - ${uptimeResult.status} (${uptimeResult.responseTimeMs}ms)`
                );
            } catch (error) {
                console.error(`Failed to monitor site ${site.id}:`, error.message);
            }
        }
    } catch (error) {
        console.error("Failed to fetch sites for monitoring:", error.message);
}
}

module.exports = {
    monitorAllSites
};