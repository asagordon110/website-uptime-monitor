// Renders all monitored site cards.
import SiteCard from "./SiteCard";

function SiteList({ sites, onDeleteSite, onCheckSite, onViewHistory, checkingId }) {
  if (sites.length === 0) {
    return <p className="muted">No sites added yet.</p>;
  }

  return (
    <div className="site-list">
      {sites.map((site) => (
        <SiteCard
          key={site.id}
          site={site}
          checkingId={checkingId}
          onDeleteSite={onDeleteSite}
          onCheckSite={onCheckSite}
          onViewHistory={onViewHistory}
        />
      ))}
    </div>
  );
}

export default SiteList;