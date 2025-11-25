const ManagerStatsCard = ({ icon, title, value, onClick, className = "" }) => (
	<div
		className={`flex flex-col items-center justify-center bg-green-900/35 rounded-2xl shadow-lg p-6 border border-green-900/10 hover:shadow-xl transition cursor-pointer ${className}`}
		onClick={onClick}
		style={{ minWidth: 220 }}
	>
		<div className="text-3xl mb-2">{icon}</div>
		<div className="text-lg font-semibold text-gray-700 mb-1">{title}</div>
		<div className="text-2xl font-extrabold text-accent-primary">{value}</div>
	</div>
);

export default ManagerStatsCard;
