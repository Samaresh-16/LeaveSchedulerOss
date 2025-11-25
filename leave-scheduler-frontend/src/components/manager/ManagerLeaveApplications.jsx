import { useState } from "react";
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle } from "react-icons/fa";

const ManagerLeaveApplications = ({
	pending = [],
	approved = [],
	rejected = [],
	showAll,
	onApprove,
	onReject,
	onShowBalance,
	loading,
}) => {
	const [rejectId, setRejectId] = useState(null);
	const [remarks, setRemarks] = useState("");
	const [rejectError, setRejectError] = useState("");

	// Combine and sort by date
	let applications = showAll
		? [...pending, ...approved, ...rejected].sort(
				(a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)
		  )
		: [...pending].sort(
				(a, b) => new Date(b.appliedOn) - new Date(a.appliedOn)
		  );

	return (
		<div className="mt-6">
			<h3 className="text-xl font-bold mb-2">Leave Applications</h3>
			{loading ? (
				<p className="p-4">Loading...</p>
			) : applications.length === 0 ? (
				<p className="p-4 text-gray-500">No leave applications found.</p>
			) : (
				<div className="overflow-x-auto rounded-lg shadow border bg-white">
					<table className="min-w-full text-sm">
						<thead className="bg-accent-green">
							<tr>
								<th className="px-4 py-2 border text-white">User</th>
								<th className="px-4 py-2 border text-white">Type</th>
								<th className="px-4 py-2 border text-white">Dates</th>
								<th className="px-4 py-2 border text-white">Status</th>
								<th className="px-4 py-2 border text-white">Reason</th>
								<th className="px-4 py-2 border text-white">Applied On</th>
								<th className="px-4 py-2 border text-white">Actions</th>
							</tr>
						</thead>
						<tbody>
							{applications.map((app) => (
								<tr
									key={app.id}
									className="text-center transition hover:bg-gray-800"
								>
									<td className="px-4 py-2 border">
										<button
											className="bg-accent-green underline px-1.5 py-1 font-semibold"
											onClick={() => onShowBalance(app.userId, app.username)}
										>
											{app.username}
										</button>
									</td>
									<td className="px-4 py-2 border">{app.leaveType}</td>
									<td className="px-4 py-2 border">
										{app.startDate} - {app.endDate}
									</td>
									<td className="px-4 py-2 border">
										{app.status === "PENDING" && (
											<FaHourglassHalf className="inline text-yellow-500" />
										)}
										{app.status === "APPROVED" && (
											<FaCheckCircle className="inline text-green-600" />
										)}
										{app.status === "REJECTED" && (
											<FaTimesCircle className="inline text-red-600" />
										)}
										<span className="ml-1">{app.status}</span>
									</td>
									<td className="px-4 py-2 border">{app.reason}</td>
									<td className="px-4 py-2 border">
										{app.appliedOn?.slice(0, 10)}
									</td>
									<td className="px-4 py-3 outline flex gap-2 justify-center">
										{app.status === "PENDING" ? (
											<>
												<button
													className="bg-accent-green text-white px-2 py-2 rounded hover:bg-accent-blue flex items-center justify-center"
													onClick={() => onApprove(app.id)}
													title="Approve"
												>
													<FaCheckCircle className="text-lg" />
												</button>
												<button
													className="bg-accent-red text-white px-2 py-2 rounded hover:bg-accent-pink flex items-center justify-center"
													onClick={() => setRejectId(app.id)}
													title="Reject"
												>
													<FaTimesCircle className="text-lg" />
												</button>
											</>
										) : app.status === "APPROVED" ? (
											<span className="text-green-600 font-semibold p-1">
												<FaCheckCircle className="text-lg text-accent-primary" />
											</span>
										) : app.status === "REJECTED" ? (
											<span className="text-red-600 font-semibold p-1">
												<FaTimesCircle className="text-lg text-accent-primary" />
											</span>
										) : null}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			{/* Reject overlay */}
			{rejectId && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md animate-fade-in flex flex-col gap-4">
						<h4 className="text-lg font-bold">Reject Leave Application</h4>
						<textarea
							className="w-full border rounded px-3 py-2"
							placeholder="Enter remarks (required)"
							value={remarks}
							onChange={(e) => setRemarks(e.target.value)}
							maxLength={255}
							required
						/>
						{rejectError && (
							<p className="text-red-600 text-sm">{rejectError}</p>
						)}
						<div className="flex gap-2 justify-end mt-2">
							<button
								className="px-4 py-2 rounded bg-gray-400 text-white"
								onClick={() => {
									setRejectId(null);
									setRemarks("");
									setRejectError("");
								}}
							>
								Cancel
							</button>
							<button
								className="px-4 py-2 rounded bg-accent-red text-white font-semibold"
								onClick={() => {
									if (!remarks.trim()) {
										setRejectError("Remarks are required to reject.");
										return;
									}
									onReject(rejectId, remarks);
									setRejectId(null);
									setRemarks("");
									setRejectError("");
								}}
							>
								Reject
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManagerLeaveApplications;
