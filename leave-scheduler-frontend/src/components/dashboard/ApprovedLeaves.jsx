import axios from "axios";
import { useEffect, useState } from "react";

const ApprovedLeaves = () => {
	const [leaveStats, setLeaveStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchLeaveStats = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("authToken");
				const res = await axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/leave-applications/stats`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setLeaveStats(res.data);
			} catch (err) {
				setError(err.response?.data?.message || "Failed to load leave stats.");
			} finally {
				setLoading(false);
			}
		};
		fetchLeaveStats();
	}, []);

	return (
		<div className="bg-green-900/80 p-6 rounded-2xl shadow w-[320px] mx-auto border border-green-800 flex flex-col justify-between">
			<h3 className="font-bold text-xl mb-4 text-green-200 flex items-center gap-2">
				<span className="inline-block w-2 h-6 bg-green-400 rounded-full"></span>
				Approved Leaves
			</h3>
			{loading ? (
				<p className="text-green-300/70 animate-pulse">
					Loading approved leaves...
				</p>
			) : error ? (
				<p className="text-green-300 text-sm font-semibold">{error}</p>
			) : leaveStats ? (
				<div className="flex flex-col items-center justify-center flex-1">
					<p className="text-3xl font-bold text-green-100">
						{leaveStats.totalUsed}
					</p>
					<p className="text-green-200 text-sm mt-2">
						Total leaves approved this year
					</p>
				</div>
			) : (
				<p className="text-green-200">--</p>
			)}
		</div>
	);
};

export default ApprovedLeaves;
