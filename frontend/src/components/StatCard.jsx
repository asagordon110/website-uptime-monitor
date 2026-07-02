// Reusable card for one dashboard statistic
function StatCard({ label, value }) {
    return (
        <div className="stat-card">
        <p className="stat-label">{label} </p>
        <h2>{value}</h2>
        </div>
    );
}

export default StatCard;