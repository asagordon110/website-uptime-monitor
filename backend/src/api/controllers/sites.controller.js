// Temporary in-memory database
let sites = [];

// 
function getSites(req, res) {
    res.status(200).json({
        sites: sites
    });
}

function createSite(req, res){
    const { name, url } = req.body;

    // validate input
    if (!name || !url){
        return res.status(400).json({
            error: "Name and URL are required."
        });
    }

    // check if site exists
    const existingSite = sites.find((site) => site.url === url);

    if (existingSite) {
        return res.status(409).json({
            error: "Site already exists"
        });
    }
    const newSite = {
        id: Date.now(),
        name: name,
        url: url,
        status: "unknown"
    };

    sites.push(newSite);

    res.status(201).json({
        message: "Site added successfully",
        site: newSite
    });
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