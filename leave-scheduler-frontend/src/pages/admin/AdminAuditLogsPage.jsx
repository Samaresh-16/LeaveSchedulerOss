import axios from "axios";
import { useEffect, useState } from "react";
import { FaClipboardList } from "react-icons/fa";

const AdminAuditLogsPage = () => {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchLogs = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("authToken");
				const res = await axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/audit-logs`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setLogs(res.data || []);
			} catch (err) {
				setError(err.response?.data?.message || "Failed to fetch audit logs.");
			} finally {
				setLoading(false);
			}
		};
		fetchLogs();
	}, []);

	return (
		<div className="max-w-4xl mx-auto p-8">
			<div className="flex items-center gap-3 mb-6">
				<FaClipboardList className="text-3xl text-accent-pink" />
				<h1 className="text-2xl font-bold text-accent-pink">
					Admin Audit Logs
				</h1>
			</div>
			{loading ? (
				<div className="text-accent-blue animate-pulse">Loading logs...</div>
			) : error ? (
				<div className="text-accent-red font-semibold">{error}</div>
			) : logs.length === 0 ? (
				<div className="text-gray-400">No audit logs found.</div>
			) : (
				<div className="overflow-x-auto rounded-lg shadow border border-gray-200">
					<table className="min-w-full bg-white">
						<thead>
							<tr className="bg-accent-pink/10 text-accent-pink">
								<th className="px-4 py-2 text-left">#</th>
								<th className="px-4 py-2 text-left">Admin ID</th>
								<th className="px-4 py-2 text-left">Action</th>
								<th className="px-4 py-2 text-left">Details</th>
								<th className="px-4 py-2 text-left">Timestamp</th>
							</tr>
						</thead>
						<tbody>
							{logs.map((log, idx) => (
								<tr key={log.id} className="border-b hover:bg-accent-pink/5">
									<td className="px-4 py-2">{idx + 1}</td>
									<td className="px-4 py-2">{log.adminId}</td>
									<td className="px-4 py-2">{log.action}</td>
									<td className="px-4 py-2">{log.details}</td>
									<td className="px-4 py-2 text-xs text-gray-500">
										{log.actionTimestamp
											? new Date(log.actionTimestamp).toLocaleString()
											: "-"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default AdminAuditLogsPage;
