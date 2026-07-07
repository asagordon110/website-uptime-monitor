// Main dashboard page: owns state, calls API helpers, and renders UI.
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import StatCard from "../components/StatCard";
import AddSiteForm from "../components/AddSiteForm";
import SiteList from "../components/SiteList";

import {
  getDashboardStats,
  getSites,
  addSite,
  deleteSite,
  checkSite,
  getCheckHistory,
} from "../api/sites.api";

function Dashboard() {
  // Stores dashboard stat totals.
  const [stats, setStats] = useState(null);

  // Stores all monitored websites.
  const [sites, setSites] = useState([]);

  // Stores selected site's check history.
  const [checkHistory, setCheckHistory] = useState([]);

  // Stores the site currently being viewed in history.
  const [selectedSite, setSelectedSite] = useState(null);

  // Stores user-facing error messages.
  const [error, setError] = useState("");

  // Tracks which site is currently being manually checked.
  const [checkingId, setCheckingId] = useState(null);

  // Stores search input.
  const [searchTerm, setSearchTerm] = useState("");

  // Stores last dashboard refresh time.
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetches dashboard stats from backend.
  const fetchStats = async () => {
    const response = await getDashboardStats();
    setStats(response.data);
  };

  // Fetches all sites from backend.
  const fetchSites = async () => {
  const response = await getSites();
  setSites(response.data.sites || []);
};

  // Refreshes both stats and sites together.
  const refreshDashboard = async () => {
    try {
      setError("");
      await Promise.all([fetchStats(), fetchSites()]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
      setError("Failed to load dashboard data.");
    }
  };

  // Loads dashboard data on page load and refreshes every 30 seconds.
  useEffect(() => {
    refreshDashboard();

    const intervalId = setInterval(() => {
      refreshDashboard();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Filters sites by name, URL, or status.
  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const term = searchTerm.toLowerCase();

      return (
        site.name.toLowerCase().includes(term) ||
        site.url.toLowerCase().includes(term) ||
        site.current_status.toLowerCase().includes(term)
      );
    });
  }, [sites, searchTerm]);

  // Adds a site and refreshes dashboard.
  const handleAddSite = async (siteData) => {
    try {
      await addSite(siteData);
      toast.success("Site added successfully");
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to add site");
    }
  };

  // Deletes a site after confirmation.
  const handleDeleteSite = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this site?");
    if (!confirmed) return;

    try {
      await deleteSite(id);
      toast.success("Site deleted");
      setSelectedSite(null);
      setCheckHistory([]);
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete site");
    }
  };

  // Manually checks one site and refreshes dashboard.
  const handleCheckSite = async (id) => {
    try {
      setCheckingId(id);
      await checkSite(id);
      toast.success("Check complete");
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      toast.error("Failed to check site");
    } finally {
      setCheckingId(null);
    }
  };

  // Loads check history for one selected site.
  const handleViewHistory = async (id) => {
    try {
      const response = await getCheckHistory(id);
      setSelectedSite(response.data.site);
      setCheckHistory(response.data.checks);
      toast.success("History loaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load check history");
    }
  };

  // Shows loading state while stats are unavailable.
  if (!stats) {
    return <div className="page">Loading dashboard...</div>;
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Website Uptime Monitor</h1>
          <p>Real-time monitoring for your websites.</p>
        </div>

        <div className="header-meta">
          <span className="live-pill">● Live</span>
          <span>
            Last Updated:{" "}
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "Loading..."}
          </span>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="stats-grid">
        <StatCard label="🌐 Total Sites" value={stats.totalSites} type="neutral" />
        <StatCard label="🟢 Sites Up" value={stats.sitesUp} type="success" />
        <StatCard label="🔴 Sites Down" value={stats.sitesDown} type="danger-card" />
        <StatCard label="🟡 Pending" value={stats.sitesPending} type="warning" />
        <StatCard label="📊 Total Checks" value={stats.totalChecks} type="info" />
      </section>

      <section className="section">
        <h2>Add Website</h2>
        <AddSiteForm onAddSite={handleAddSite} />
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Monitored Sites</h2>

          <input
            className="search-input"
            type="text"
            placeholder="Search by name, URL, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <SiteList
          sites={filteredSites}
          checkingId={checkingId}
          onDeleteSite={handleDeleteSite}
          onCheckSite={handleCheckSite}
          onViewHistory={handleViewHistory}
        />
      </section>

      {selectedSite && (
        <section className="section">
          <h2>Check History: {selectedSite.name}</h2>

          {checkHistory.length === 0 ? (
            <p className="muted">No checks yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Status Code</th>
                    <th>Response Time</th>
                    <th>Error</th>
                    <th>Checked At</th>
                  </tr>
                </thead>

                <tbody>
                  {checkHistory.map((check) => (
                    <tr key={check.id}>
                      <td>
                        <span className={`badge ${check.status === "UP" ? "up" : "down"}`}>
                          {check.status}
                        </span>
                      </td>
                      <td>{check.status_code ?? "N/A"}</td>
                      <td>{check.response_time_ms}ms</td>
                      <td>{check.error_message || "None"}</td>
                      <td>{new Date(check.checked_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default Dashboard;