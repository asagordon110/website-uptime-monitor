// Renders the list of monitored sites.
import SiteCard from "./SiteCard";

function SiteList({ sites, onDeleteSite, onCheckSite, onViewHistory }) {
  if (sites.length === 0) {
    return <p>No sites added yet.</p>;
  }

  return (
    <div className="site-list">
      {sites.map((site) => (
        <SiteCard
          key={site.id}
          site={site}
          onDeleteSite={onDeleteSite}
          onCheckSite={onCheckSite}
          onViewHistory={onViewHistory}
        />
      ))}
    </div>
  );
}

export default SiteList;