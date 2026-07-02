// Import Axios
const axios = require('axios');

// Function to check if website is up
async function checkWebsite(url){
    const startTime = Date.now(); // Track start time 

    try {
        // Axios sends request to the URL with a timeout of 5 seconds
        const response = await axios.get(url, {
            timeout: 5000,
            validateStatus: () => true // Accept all status codes
        });

        const responseTimeMs = Date.now() - startTime;

        return {
            // If response status code is 200-399 -> UP, if code is 400-599 -> DOWN
            status: response.status >= 200 && response.status < 400 ? "UP" : "DOWN",
            statusCode: response.status,
            responseTimeMs: responseTimeMs,
            errorMessage: null
        };
    } catch (error) {
        const responseTimeMs = Date.now() - startTime;

        return {
            status: "DOWN",
            statusCode: error.response ? error.response.status : null,
            responseTimeMs: responseTimeMs,
            errorMessage: error.message
        };
    }
}

module.exports = {
    checkWebsite
}