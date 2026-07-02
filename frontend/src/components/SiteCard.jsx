// Displays one monitored site and its actions.
function SiteCard({ site, onDeleteSite, onCheckSite, onViewHistory }) {
  const isUp = site.current_status === "UP";

  return (
    <div className="site-card">
      <div>
        <h3>{isUp ? "🟢" : "🔴"} {site.name}</h3>
        <p>{site.url}</p>
        <p>Status: <strong>{site.current_status}</strong></p>
      </div>

      <div className="site-actions">
        <button onClick={() => onCheckSite(site.id)}>Check Now</button>
        <button onClick={() => onViewHistory(site.id)}>View History</button>
        <button className="danger" onClick={() => onDeleteSite(site.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default SiteCard;