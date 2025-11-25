import axios from "axios";
import { useEffect, useState } from "react";

const LeaveHistory = () => {
	const [leaveHistory, setLeaveHistory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState({ startDate: "", endDate: "" });

	const fetchLeaveHistory = async (params = {}) => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("authToken");
			const query = [];
			if (params.startDate) query.push(`startDate=${params.startDate}`);
			if (params.endDate) query.push(`endDate=${params.endDate}`);
			const url =
				`${
					import.meta.env.VITE_API_BASE_URL
				}/api/leave-applications/filter-history` +
				(query.length ? `?${query.join("&")}` : "");
			const res = await axios.get(url, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = Array.isArray(res.data) ? res.data : [];
			setLeaveHistory(data);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to load leave history.");
			setLeaveHistory([]); // Defensive: always set to array on error
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLeaveHistory();
	}, []);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilter((prev) => ({ ...prev, [name]: value }));
	};

	const handleFilterSubmit = (e) => {
		e.preventDefault();
		fetchLeaveHistory(filter);
	};

	return (
		<div>
			<h3 className="text-lg font-semibold mb-3">Leave History</h3>
			<form
				onSubmit={handleFilterSubmit}
				className="flex flex-col md:flex-row gap-2 mb-4 items-center"
			>
				<input
					type="date"
					name="startDate"
					value={filter.startDate}
					onChange={handleFilterChange}
					className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
					placeholder="Start Date"
				/>
				<span className="text-gray-500">to</span>
				<input
					type="date"
					name="endDate"
					value={filter.endDate}
					onChange={handleFilterChange}
					className="border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
					placeholder="End Date"
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
				>
					Filter
				</button>
			</form>
			<div className="overflow-x-auto rounded-lg shadow border bg-white">
				{loading ? (
					<p className="p-4">Loading...</p>
				) : error ? (
					<p className="p-4 text-red-600">{error}</p>
				) : (
					<table className="min-w-full text-sm">
						<thead className="bg-accent-blue">
							<tr>
								<th className="px-4 py-2 border">Type</th>
								<th className="px-4 py-2 border">Start</th>
								<th className="px-4 py-2 border">End</th>
								<th className="px-4 py-2 border">Days</th>
								<th className="px-4 py-2 border">Status</th>
								<th className="px-4 py-2 border">Applied On</th>
								<th className="px-4 py-2 border">Remarks</th>
							</tr>
						</thead>
						<tbody>
							{Array.isArray(leaveHistory) && leaveHistory.length > 0 ? (
								leaveHistory.map((leave) => (
									<tr
										key={leave.id}
										className="text-center transition hover:bg-gray-500"
									>
										<td className="px-4 py-2 border">{leave.leaveType}</td>
										<td className="px-4 py-2 border">{leave.startDate}</td>
										<td className="px-4 py-2 border">{leave.endDate}</td>
										<td className="px-4 py-2 border">{leave.numberOfDays}</td>
										<td className="px-4 py-2 border font-semibold">
											<button
												className={
													leave.status === "APPROVED"
														? "bg-accent-green p-1 text-primary-90"
														: leave.status == "PENDING"
														? "bg-accent-yellow p-1 text-primary-900"
														: leave.status === "REJECTED"
														? "bg-accent-red p-1 text-primary-90"
														: "bg-card-bg p-1 text-primary-90"
												}
											>
												{leave.status}
											</button>
										</td>
										<td className="px-4 py-2 border">
											{leave.appliedOn?.split("T")[0]}
										</td>
										<td className="px-4 py-2 border">{leave.remarks || "-"}</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="7" className="p-4 text-gray-500 text-center">
										No leave history available.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
};

export default LeaveHistory;
