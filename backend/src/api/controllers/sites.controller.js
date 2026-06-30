const pool = require("../../db/pool");

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


module.exports = {
    getSites,
    createSite,
    deleteSite,
};