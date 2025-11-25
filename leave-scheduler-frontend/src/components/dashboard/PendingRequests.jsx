import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PendingRequests = () => {
	const [pendingRequests, setPendingRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchPendingRequests = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("authToken");
				const res = await axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/leave-applications/pending`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setPendingRequests(res.data);
			} catch (err) {
				setError(
					err.response?.data?.message || "Failed to load pending requests."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchPendingRequests();
	}, []);

	return (
		<div className="bg-yellow-900/80 p-6 rounded-2xl shadow w-[320px] mx-auto border border-yellow-800 flex flex-col justify-between">
			<h3 className="font-bold text-xl mb-4 text-yellow-200 flex items-center gap-2">
				<span className="inline-block w-2 h-6 bg-yellow-400 rounded-full"></span>
				Pending Requests
			</h3>
			{loading ? (
				<p className="text-yellow-300/70 animate-pulse">
					Loading pending requests...
				</p>
			) : error ? (
				<p className="text-yellow-300 text-sm font-semibold">{error}</p>
			) : (
				<div className="flex-1 flex flex-col justify-between">
					<button
						onClick={() => navigate("/leave-applications")}
						className="w-full mt-2 px-4 py-2 bg-yellow-600 text-yellow-50 rounded-lg font-bold shadow-sm hover:bg-yellow-500 transition"
					>
						{pendingRequests.length} Pending
					</button>
					<p className="text-yellow-200 text-sm mt-2">
						Click to view all your pending leave requests.
					</p>
				</div>
			)}
		</div>
	);
};

export default PendingRequests;
