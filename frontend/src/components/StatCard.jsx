// Reusable colorful dashboard stat card.
function StatCard({ label, value, type }) {
  return (
    <div className={`stat-card ${type}`}>
      <p className="stat-label">{label}</p>
      <h2>{value}</h2>
    </div>
  );
}

export default StatCard;