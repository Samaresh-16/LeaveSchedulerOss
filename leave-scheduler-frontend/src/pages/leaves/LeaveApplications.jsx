import axios from "axios";
import { useEffect, useState } from "react";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

const LeaveApplications = () => {
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [eligibility, setEligibility] = useState([]);
	const [stats, setStats] = useState(null);
	const [withdrawingId, setWithdrawingId] = useState(null);
	const [showPendingOnly, setShowPendingOnly] = useState(false);
	const [pendingLoading, setPendingLoading] = useState(false);

	useEffect(() => {
		const fetchApplications = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("authToken");
				const res = await axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/leave-applications`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setApplications(res.data);
			} catch (err) {
				setError(
					err.response?.data?.message || "Failed to load leave applications."
				);
			} finally {
				setLoading(false);
			}
		};
		fetchApplications();
	}, []);

	useEffect(() => {
		const fetchEligibilityAndStats = async () => {
			try {
				const token = localStorage.getItem("authToken");
				const [eligRes, statsRes] = await Promise.all([
					axios.get(
						`${
							import.meta.env.VITE_API_BASE_URL
						}/api/leave-applications/eligibility`,
						{ headers: { Authorization: `Bearer ${token}` } }
					),
					axios.get(
						`${import.meta.env.VITE_API_BASE_URL}/api/leave-applications/stats`,
						{ headers: { Authorization: `Bearer ${token}` } }
					),
				]);
				setEligibility(eligRes.data || []);
				setStats(statsRes.data || null);
			} catch (e) {
				console.error(
					e.response?.data?.message || "Failed to load eligibility and stats."
				);
				setEligibility([]);
				setStats(null);
			}
		};
		fetchEligibilityAndStats();
	}, []);

	const handleWithdraw = async (id) => {
		setWithdrawingId(id);
		try {
			const token = localStorage.getItem("authToken");
			await axios.put(
				`${
					import.meta.env.VITE_API_BASE_URL
				}/api/leave-applications/${id}/withdraw`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setApplications((prev) =>
				prev.map((a) => (a.id === id ? { ...a, status: "WITHDRAWN" } : a))
			);
		} catch (e) {
			console.error(
				e.response?.data?.message || "Failed to withdraw leave application."
			);
			setError("Failed to withdraw leave application.");
		}
		setWithdrawingId(null);
	};

	const handleTogglePending = async () => {
		if (!showPendingOnly) {
			setPendingLoading(true);
			try {
				const token = localStorage.getItem("authToken");
				const res = await axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/leave-applications/pending`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setApplications(res.data || []);
			} catch (e) {
				console.error(
					e.response?.data?.message || "Failed to load pending applications."
				);
				setError("Failed to load pending applications.");
			}
			setPendingLoading(false);
		} else {
			// Show all applications again
			setPendingLoading(true);
			try {
				const token = localStorage.getItem("authToken");
				const res = await axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/leave-applications`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setApplications(res.data || []);
			} catch (e) {
				console.error(
					e.response?.data?.message || "Failed to load leave applications."
				);
				setError("Failed to load leave applications.");
			}
			setPendingLoading(false);
		}
		setShowPendingOnly((prev) => !prev);
	};

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">My Leave Applications</h1>
			<div className="flex flex-col md:flex-row gap-8">
				{/* Center: Leave Applications Table (left-aligned) */}
				<div className="flex-1 order-1 md:order-none">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold">Applications</h2>
						<div className="flex items-center gap-2">
							<label
								htmlFor="pending-toggle"
								className="flex items-center cursor-pointer select-none"
							>
								<span className="mr-2 text-sm font-medium text-gray-700">
									{showPendingOnly
										? "Showing PENDING Applications"
										: "Showing ALL Applications"}
								</span>
								<input
									id="pending-toggle"
									type="checkbox"
									checked={showPendingOnly}
									onChange={handleTogglePending}
									className="sr-only"
									disabled={pendingLoading}
								/>
								<div
									className={`w-10 h-5 flex items-center bg-gray-300 rounded-full p-1 duration-300 ease-in-out ${
										showPendingOnly ? "bg-accent-yellow" : ""
									}`}
								>
									<div
										className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${
											showPendingOnly ? "translate-x-5" : ""
										}`}
									></div>
								</div>
							</label>
						</div>
					</div>
					{loading || pendingLoading ? (
						<p>Loading...</p>
					) : error ? (
						<p className="text-red-600">{error}</p>
					) : applications.length === 0 ? (
						<p className="text-gray-500">No leave applications found.</p>
					) : (
						<div className="overflow-x-auto rounded-lg shadow border bg-white">
							<table className="min-w-full text-sm">
								<thead className="bg-accent-blue">
									<tr>
										<th className="px-4 py-2 border">Type</th>
										<th className="px-4 py-2 border">Start Date</th>
										<th className="px-4 py-2 border">End Date</th>
										<th className="px-4 py-2 border">Days</th>
										<th className="px-4 py-2 border">Status</th>
										<th className="px-4 py-2 border">Applied On</th>
										<th className="px-4 py-2 border">Actions</th>
									</tr>
								</thead>
								<tbody>
									{applications.map((app) => (
										<tr
											key={app.id}
											className="text-center transition hover:bg-gray-500"
										>
											<td className="px-4 py-2 border">{app.leaveType}</td>
											<td className="px-4 py-2 border">{app.startDate}</td>
											<td className="px-4 py-2 border">{app.endDate}</td>
											<td className="px-4 py-2 border">{app.numberOfDays}</td>
											<td className="px-4 py-2 border font-semibold">
												<button
													className={
														app.status === "APPROVED"
															? "bg-accent-green p-1 text-primary-90"
															: app.status == "PENDING"
															? "bg-accent-yellow p-1 text-primary-900"
															: app.status === "REJECTED"
															? "bg-accent-red p-1 text-primary-90"
															: "bg-card-bg p-1 text-primary-90"
													}
												>
													{app.status}
												</button>
											</td>
											<td className="px-4 py-2 border">
												{app.appliedOn?.split("T")[0]}
											</td>
											<td className="px-4 py-2 border">
												{app.status === "PENDING" && (
													<button
														disabled={withdrawingId === app.id}
														onClick={() => handleWithdraw(app.id)}
														className="bg-accent-red text-white px-2 py-1 rounded shadow hover:bg-accent-pink transition disabled:opacity-60 flex items-center gap-1"
														title="Withdraw Application"
													>
														<FaTimes />
														<span>Withdraw</span>
													</button>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{/* Right: Metrics (Eligibility & Stats) */}
				<div className="md:w flex flex-col gap-6 order-2 md:order-none">
					<h2 className="text-lg font-bold mb-2 text-accent-blue">Metrics</h2>
					{/* ra Eligibility Card */}
					<div
						className="bg-blue-900/20 border-blue-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.035] hover:shadow-[0_8px_32px_0_#004d6144] group animate-card-pop cursor-pointer focus-within:ring-2 focus-within:ring-accent-pink"
						tabIndex={0}
						role="region"
						aria-label="Leave Eligibility"
					>
						<div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-300" />
						<div className="flex items-center gap-2 mb-2">
							<FaInfoCircle className="text-accent-blue text-xl group-hover:scale-125 group-hover:text-accent-pink transition-all duration-200" />
							<span className="font-bold text-accent-blue text-lg tracking-wide group-hover:text-accent-pink transition-colors duration-200">
								Leave Eligibility
							</span>
						</div>
						{eligibility.length === 0 ? (
							<p className="text-gray-400 text-sm">No eligibility data.</p>
						) : (
							<table className="w-full text-xs rounded-lg overflow-hidden animate-fade-in">
								<thead>
									<tr className="bg-accent-blue text-white">
										<th className="px-2 py-1 font-semibold">Type</th>
										<th className="px-2 py-1 font-semibold">Balance</th>
										<th className="px-2 py-1 font-semibold">Used</th>
										<th className="px-2 py-1 font-semibold">Year</th>
									</tr>
								</thead>
								<tbody>
									{eligibility.map((e, idx) => (
										<tr
											key={e.id}
											className={`text-center transition-colors duration-200 ${
												idx % 2 === 0 ? "bg-white/10" : "bg-white/20"
											} hover:bg-accent-pink group-hover:bg-accent-pink`}
										>
											<td className="px-2 py-1 font-semibold text-accent-blue group-hover:text-accent-pink transition-colors duration-200">
												{e.leaveTypeName || e.leaveType}
											</td>
											<td className="px-2 py-1">{e.balance}</td>
											<td className="px-2 py-1">{e.used}</td>
											<td className="px-2 py-1">{e.year}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
					{/* Leave Stats Card */}
					<div
						className="bg-green-900/20 p-6 border-green-800 relative rounded-2xl shadow-2xl p-6 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.035] hover:shadow-[0_8px_32px_0_#3e564144] group animate-card-pop cursor-pointer focus-within:ring-2 focus-within:ring-accent-blue"
						tabIndex={0}
						role="region"
						aria-label="Leave Stats"
					>
						<div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gray-300" />
						<div className="flex items-center gap-2 mb-2">
							<FaInfoCircle className="text-accent-green text-xl group-hover:scale-125 group-hover:text-accent-blue transition-all duration-200" />
							<span className="font-bold text-accent-green text-lg tracking-wide group-hover:text-accent-blue transition-colors duration-200">
								Leave Stats
							</span>
						</div>
						{!stats ? (
							<p className="text-gray-400 text-sm">No stats data.</p>
						) : (
							<ul className="text-base space-y-2 animate-fade-in">
								<li className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-200">
									<span className="font-semibold text-accent-green group-hover:text-accent-blue transition-colors duration-200">
										Total Balance:
									</span>
									<span className="bg-white px-2 py-1 rounded shadow text-accent-blue font-bold tracking-wide">
										{stats.totalBalance}
									</span>
								</li>
								<li className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-200">
									<span className="font-semibold text-accent-green group-hover:text-accent-blue transition-colors duration-200">
										Total Used:
									</span>
									<span className="bg-white px-2 py-1 rounded shadow text-accent-pink font-bold tracking-wide">
										{stats.totalUsed}
									</span>
								</li>
								<li className="flex items-center gap-2 group-hover:scale-105 transition-transform duration-200">
									<span className="font-semibold text-accent-green group-hover:text-accent-blue transition-colors duration-200">
										Pending Leaves:
									</span>
									<span className="bg-white px-2 py-1 rounded shadow text-accent-yellow font-bold tracking-wide">
										{stats.pendingLeaves}
									</span>
								</li>
							</ul>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default LeaveApplications;
