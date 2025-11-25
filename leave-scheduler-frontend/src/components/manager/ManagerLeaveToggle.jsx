const ManagerLeaveToggle = ({ showAll, setShowAll }) => (
	<div className="flex items-center gap-4 mb-4">
		<span className="font-semibold text-gray-700">Show:</span>
		<button
			className={`px-4 py-2 rounded-l-lg border border-accent-blue font-semibold transition ${
				showAll ? "bg-accent-green text-white" : "bg-white text-accent-blue"
			}`}
			onClick={() => setShowAll(true)}
		>
			All
		</button>
		<button
			className={`px-4 py-2 bg-accent-yellow rounded-r-lg border border-accent-blue font-semibold transition ${
				!showAll ? "bg-accent-blue text-primary" : "bg-white text-accent-blue"
			}`}
			onClick={() => setShowAll(false)}
		>
			Pending
		</button>
	</div>
);

export default ManagerLeaveToggle;
