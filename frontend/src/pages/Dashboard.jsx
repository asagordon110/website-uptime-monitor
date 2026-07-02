// This is the main entry point for the dashboard page
import React, { useState, useEffect } from 'react';
import api from '../api/api'; // Import the Axios instance for API requests

function Dashboard() {
    // STATE - a box where React remembers the numbers
    // Starts as null because we have no data yet
    const [stats, setStats] = useState(null);

    // EFFECT - runs once when the page first appears
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get("/sites/dashboard/stats"); // Make a GET request to the backend API
                setStats(response.data); // Update the state with the response data
            } catch (error) {
                console.error("Error fetching dashboard stats:", error); // Log any errors
            }
        };

        fetchStats(); // Call the function to fetch stats
    }, []); // empty [] means this effect runs only once when the component mounts

    // While waiting for the api, send something friendly to the user
    if (!stats) {
        return <div>Loading dashboard stats...</div>; // Show a loading message while data is being fetched
    }

    // RENDER - disply the values from state
    return (
        <div>
            <h1>Website Uptime Monitor</h1>
            <p>Total Sites: {stats.totalSites}</p>
            <p>Sites up: {stats.sitesUp}</p>
            <p>Sites down: {stats.sitesDown}</p>
            <p>Sites pending: {stats.sitesPending}</p>
            <p>Total Checks: {stats.totalChecks}</p>
        </div>
    );
}

export default Dashboard; // Export the Dashboard component for use in other parts of the app