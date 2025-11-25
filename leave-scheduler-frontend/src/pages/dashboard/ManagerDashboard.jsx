import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { FaHourglassHalf, FaUserGroup } from "react-icons/fa6";
import ManagerLeaveApplications from "../../components/manager/ManagerLeaveApplications";
import ManagerLeaveToggle from "../../components/manager/ManagerLeaveToggle";
import ManagerStatsCard from "../../components/manager/ManagerStatsCard";
import ManagerSubordinatesTable from "../../components/manager/ManagerSubordinatesTable";

const ManagerDashboard = () => {
	const [pending, setPending] = useState([]);
	const [approved, setApproved] = useState([]);
	const [rejected, setRejected] = useState([]);
	const [subordinates, setSubordinates] = useState([]);
	const [showSubTable, setShowSubTable] = useState(false);
	const [showAll, setShowAll] = useState(true);
	const [loading, setLoading] = useState(false);
	const [subLoading, setSubLoading] = useState(false);
	const [leaveLoading, setLeaveLoading] = useState(false);
	const [showBalance, setShowBalance] = useState(null); // { userId, username, balances }
	const approveSectionRef = useRef(null);

	// Fetch leave applications
	useEffect(() => {
		const fetchLeaves = async () => {
			setLeaveLoading(true);
			try {
				const token = localStorage.getItem("authToken");
				const headers = { Authorization: `Bearer ${token}` };
				const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
					axios.get(
						`${import.meta.env.VITE_API_BASE_URL}/api/leave-approvals/pending`,
						{ headers }
					),
					axios.get(
						`${import.meta.env.VITE_API_BASE_URL}/api/leave-approvals/approved`,
						{ headers }
					),
					axios.get(
						`${import.meta.env.VITE_API_BASE_URL}/api/leave-approvals/rejected`,
						{ headers }
					),
				]);
				setPending(pendingRes.data || []);
				setApproved(approvedRes.data || []);
				setRejected(rejectedRes.data || []);
			} catch {
				setPending([]);
				setApproved([]);
				setRejected([]);
			} finally {
				setLeaveLoading(false);
			}
		};
		fetchLeaves();
	}, []);

	// Fetch subordinates
	const fetchSubordinates = async () => {
		setSubLoading(true);
		try {
			const token = localStorage.getItem("authToken");
			const headers = { Authorization: `Bearer ${token}` };
			const res = await axios.get(
				`${import.meta.env.VITE_API_BASE_URL}/api/users/managed`,
				{ headers }
			);
			setSubordinates(res.data || []);
		} catch {
			setSubordinates([]);
		} finally {
			setSubLoading(false);
		}
	};

	// Approve leave
	const handleApprove = async (id) => {
		setLoading(true);
		try {
			const token = localStorage.getItem("authToken");
			await axios.put(
				`${
					import.meta.env.VITE_API_BASE_URL
				}/api/leave-approvals/${id}/approve`,
				{ status: "APPROVED", remarks: "" },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setPending((prev) => prev.filter((l) => l.id !== id));
			// Optionally refetch approved
		} finally {
			setLoading(false);
		}
	};

	// Reject leave
	const handleReject = async (id, remarks) => {
		setLoading(true);
		try {
			const token = localStorage.getItem("authToken");
			await axios.put(
				`${import.meta.env.VITE_API_BASE_URL}/api/leave-approvals/${id}/reject`,
				{ status: "REJECTED", remarks },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setPending((prev) => prev.filter((l) => l.id !== id));
			// Optionally refetch rejected
		} finally {
			setLoading(false);
		}
	};

	// Show leave balance for user
	const handleShowBalance = async (userId, username) => {
		setShowBalance({ userId, username, balances: null, loading: true });
		try {
			const token = localStorage.getItem("authToken");
			const res = await axios.get(
				`${
					import.meta.env.VITE_API_BASE_URL
				}/api/users/${userId}/leave-balance`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setShowBalance({ userId, username, balances: res.data, loading: false });
		} catch {
			setShowBalance({ userId, username, balances: [], loading: false });
		}
	};

	// Scroll to approve section
	const scrollToApprove = () => {
		approveSectionRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in text-center">
				<h1 className="w-full text-4xl font-extrabold text-primary flex items-center justify-center gap-3 animate-fade-in">
					<FaUserGroup className="text-accent-green text-5xl drop-shadow" />
					Manager Dashboard
				</h1>
			</div>
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
				<ManagerStatsCard
					icon={<FaHourglassHalf className="text-accent-yellow" />}
					title="Pending Applications"
					value={pending.length}
					onClick={scrollToApprove}
				/>
				<ManagerStatsCard
					icon={<FaUserGroup className="text-accent-red" />}
					title="Subordinates"
					value={
						subordinates.length == 0
							? "Click to view details"
							: subordinates.length
					}
					onClick={() => {
						if (!subordinates.length) fetchSubordinates();
						setShowSubTable((v) => !v);
					}}
				/>
			</div>
			{/* Subordinates Table */}
			{showSubTable && (
				<div className="mb-8">
					<h3 className="text-xl font-bold mb-2">Subordinates</h3>
					{subLoading ? (
						<p className="p-4">Loading...</p>
					) : (
						<ManagerSubordinatesTable subordinates={subordinates} />
					)}
				</div>
			)}
			{/* Leave Applications Section */}
			<div ref={approveSectionRef} className="mb-8">
				<ManagerLeaveToggle showAll={showAll} setShowAll={setShowAll} />
				<ManagerLeaveApplications
					pending={pending}
					approved={approved}
					rejected={rejected}
					showAll={showAll}
					onApprove={handleApprove}
					onReject={handleReject}
					onShowBalance={handleShowBalance}
					loading={leaveLoading || loading}
				/>
			</div>
			{/* Leave Balance Overlay */}
			{showBalance && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md animate-fade-in flex flex-col gap-4">
						<h4 className="text-lg font-bold mb-2">
							{showBalance.username}'s Leave Balances
						</h4>
						{showBalance.loading ? (
							<p>Loading...</p>
						) : showBalance.balances && showBalance.balances.length > 0 ? (
							<table className="min-w-full text-sm">
								<thead>
									<tr>
										<th className="px-4 py-2 border">Type</th>
										<th className="px-4 py-2 border">Balance</th>
									</tr>
								</thead>
								<tbody>
									{showBalance.balances.map((b, i) => (
										<tr key={i}>
											<td className="px-4 py-2 border">{b.leaveType}</td>
											<td className="px-4 py-2 border">{b.balance}</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<p>No leave balances found.</p>
						)}
						<button
							className="px-4 py-2 rounded bg-accent-blue text-white font-semibold mt-2"
							onClick={() => setShowBalance(null)}
						>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ManagerDashboard;
