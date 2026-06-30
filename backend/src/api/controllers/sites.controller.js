const pool = require("../../db/pool");// 


function getSites(req, res) {
    res.status(200).json({
        sites: sites
    });
}

async function createSite(req, res){
    const { name, url } = req.body;

    // validate input
    if (!name || !url){
        return res.status(400).json({
            error: "Name and URL are required."
        });
    }

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

        res.status(500).json({
            error: "Failed to add site."
        });
    }
}

function deleteSite(req, res){
    const id = Number(req.params.id);

    const siteExist = sites.find((site) => site.id === id);

    if (!siteExist){
        return res.status(404).json({
            error: "Site not found"
        });
    }

    sites = sites.filter((site) => site.id !== id);

    res.status(200).json({
        message: "Site deleted successfully"
    });
}

function updateSiteStatus(req,res){
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status || !["up", "down"].includes(status)) {
        return res.status(400).json({
            error: "status must be 'up' or 'down'"
        });
    }

    const site = sites.find((site) => site.id === id);

    if(!site){
        return res.status(404).json({
            error: "site not found"
        });
    }

    site.status = status;

    res.status(200).json({
        message: "Status updated successfully",
        site: site
    });
}

module.exports = {
    getSites,
    createSite,
    deleteSite,
    updateSiteStatus
};