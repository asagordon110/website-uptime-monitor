// Displays one monitored site and its action buttons.
function SiteCard({ site, onDeleteSite, onCheckSite, onViewHistory, checkingId }) {
  const isUp = site.current_status === "UP";
  const isChecking = checkingId === site.id;

  return (
    <div className="site-card">
      <div>
        <div className="site-header">
          <h3>{site.name}</h3>
          <span className={`badge ${isUp ? "up" : "down"}`}>
            {site.current_status}
          </span>
        </div>

        <p className="site-url">{site.url}</p>
        <p className="muted">
          Last Checked:{" "} {site.last_checked_at ? new Date(site.last_checked_at).toLocaleString()
  : "Not available"}
        </p>
      </div>

      <div className="site-actions">
        <button onClick={() => onCheckSite(site.id)} disabled={isChecking}>
          {isChecking ? "Checking..." : "Check Now"}
        </button>

        <button onClick={() => onViewHistory(site.id)}>View History</button>

        <button className="danger" onClick={() => onDeleteSite(site.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default SiteCard;