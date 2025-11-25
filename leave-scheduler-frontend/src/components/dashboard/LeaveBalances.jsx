import axios from "axios";
import { useEffect, useState } from "react";

const LeaveBalances = () => {
	const [leaveBalances, setLeaveBalances] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchLeaveBalances = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("authToken");
				const res = await axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/users/leave-balance`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setLeaveBalances(res.data);
			} catch (err) {
				setError(
					err.response?.data?.message || "Failed to load leave balances."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchLeaveBalances();
	}, []);

	// Defensive: ensure leaveBalances is always an array
	const safeLeaveBalances = Array.isArray(leaveBalances) ? leaveBalances : [];
	const totalBalance = safeLeaveBalances.reduce(
		(sum, bal) =>
			sum + (bal && typeof bal.balance === "number" ? bal.balance : 0),
		0
	);

	return (
		<div className="bg-red-900/80 p-6 rounded-2xl shadow w-[320px] mx-auto border border-red-800 flex flex-col justify-between">
			<h3 className="font-bold text-xl mb-4 text-red-200 flex items-center gap-2">
				<span className="inline-block w-2 h-6 bg-red-400 rounded-full"></span>
				Leave Balances
			</h3>
			{loading ? (
				<p className="text-red-300/70 animate-pulse">
					Loading leave balances...
				</p>
			) : error ? (
				<p className="text-red-300 text-sm font-semibold">{error}</p>
			) : leaveBalances.length === 0 ? (
				<p className="text-red-300/70">No leave balances found.</p>
			) : (
				<div className="flex-1 flex flex-col justify-between">
					<ul className="text-left text-base mb-3 divide-y divide-red-200">
						{safeLeaveBalances.map((bal) => (
							<li
								key={bal.id || bal.leaveTypeName}
								className="py-2 flex justify-between items-center"
							>
								<span className="font-medium text-red-200">
									{bal.leaveTypeName || bal.leaveType}
								</span>
								<span className="font-bold text-red-100 bg-red-800/70 px-3 py-1 rounded-lg shadow-sm">
									{bal.balance} days
								</span>
							</li>
						))}
					</ul>
					<div className="font-bold text-lg text-red-100 mt-4 flex items-center gap-2">
						<span className="bg-red-400 w-4 h-4 rounded-full inline-block"></span>
						Total: {totalBalance} days
					</div>
				</div>
			)}
		</div>
	);
};

export default LeaveBalances;
