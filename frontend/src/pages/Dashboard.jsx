// Main dashboard page: loads data, stores state, and handles API actions.
import { useEffect, useState } from "react";
import api from "../api/api";
import StatCard from "../components/StatCard";
import AddSiteForm from "../components/AddSiteForm";
import SiteList from "../components/SiteList";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sites, setSites] = useState([]);
  const [checkHistory, setCheckHistory] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [error, setError] = useState("");

  // Fetches dashboard stats from backend.
  const fetchStats = async () => {
    const response = await api.get("/sites/dashboard/stats");
    setStats(response.data);
  };

  // Fetches all monitored sites from backend.
  const fetchSites = async () => {
    const response = await api.get("/sites");
    setSites(response.data.sites);
  };

  // Refreshes all dashboard data.
  const refreshDashboard = async () => {
    try {
      setError("");
      await fetchStats();
      await fetchSites();
    } catch (error) {
      console.error(error);
      setError("Failed to load dashboard data.");
    }
  };

  // Runs once when page loads.
  useEffect(() => {
    refreshDashboard();
  }, []);

  // Adds a site, then refreshes dashboard data.
  const handleAddSite = async (siteData) => {
    try {
      await api.post("/sites", siteData);
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      setError("Failed to add site.");
    }
  };

  // Deletes a site, then refreshes dashboard data.
  const handleDeleteSite = async (id) => {
    try {
      await api.delete(`/sites/${id}`);
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      setError("Failed to delete site.");
    }
  };

  // Manually checks a site, then refreshes dashboard data.
  const handleCheckSite = async (id) => {
    try {
      await api.post(`/sites/${id}/check`);
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      setError("Failed to check site.");
    }
  };

  // Loads check history for one selected site.
  const handleViewHistory = async (id) => {
  console.log("History clicked for site:", id);

  try {
    const response = await api.get(`/sites/${id}/checks`);
    console.log("History response:", response.data);

    setSelectedSite(response.data.site);
    setCheckHistory(response.data.checks);
  } catch (error) {
    console.error(error);
    setError("Failed to load check history.");
  }
};

  if (!stats) {
    return <div className="page">Loading dashboard...</div>;
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Website Uptime Monitor</h1>
        <p>Track website status, response time, and uptime history.</p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="stats-grid">
        <StatCard label="Total Sites" value={stats.totalSites} />
        <StatCard label="Sites Up" value={stats.sitesUp} />
        <StatCard label="Sites Down" value={stats.sitesDown} />
        <StatCard label="Pending" value={stats.sitesPending} />
        <StatCard label="Total Checks" value={stats.totalChecks} />
      </section>

      <section className="section">
        <h2>Add Website</h2>
        <AddSiteForm onAddSite={handleAddSite} />
      </section>

      <section className="section">
        <h2>Monitored Sites</h2>
        <SiteList
          sites={sites}
          onDeleteSite={handleDeleteSite}
          onCheckSite={handleCheckSite}
          onViewHistory={handleViewHistory}
        />
      </section>

      {selectedSite && (
        <section className="section">
          <h2>Check History: {selectedSite.name}</h2>

          {checkHistory.length === 0 ? (
            <p>No checks yet.</p>
          ) : (
            <div className="history-list">
              {checkHistory.map((check) => (
                <div className="history-item" key={check.id}>
                  <strong>{check.status}</strong>
                  <span>Status Code: {check.status_code ?? "N/A"}</span>
                  <span>Response: {check.response_time_ms}ms</span>
                  <span>{new Date(check.checked_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Dashboard;