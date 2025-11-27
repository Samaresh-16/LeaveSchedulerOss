
const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend }) => {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        {trend && (
          <div className={`stat-trend ${trend.direction}`}>{trend.label}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;