import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
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
  const [checkingId, setCheckingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = async () => {
    const response = await api.get("/sites/dashboard/stats");
    setStats(response.data);
  };

  const fetchSites = async () => {
    const response = await api.get("/sites");
    setSites(response.data.sites);
  };

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

  useEffect(() => {
    refreshDashboard();

    const intervalId = setInterval(() => {
      refreshDashboard();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

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

  const handleAddSite = async (siteData) => {
    try {
      await api.post("/sites", siteData);
      toast.success("Site added successfully");
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to add site");
    }
  };

  const handleDeleteSite = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this site?");
    if (!confirmed) return;

    try {
      await api.delete(`/sites/${id}`);
      toast.success("Site deleted");
      setSelectedSite(null);
      setCheckHistory([]);
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete site");
    }
  };

  const handleCheckSite = async (id) => {
    try {
      setCheckingId(id);
      await api.post(`/sites/${id}/check`);
      toast.success("Check complete");
      await refreshDashboard();
    } catch (error) {
      console.error(error);
      toast.error("Failed to check site");
    } finally {
      setCheckingId(null);
    }
  };

  const handleViewHistory = async (id) => {
    try {
      const response = await api.get(`/sites/${id}/checks`);
      setSelectedSite(response.data.site);
      setCheckHistory(response.data.checks);
      toast.success("History loaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to load check history");
    }
  };

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