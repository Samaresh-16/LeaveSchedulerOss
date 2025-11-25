import axios from "axios";
import { useState } from "react";
import {
	FaCalendarPlus,
	FaCoins,
	FaFileDownload,
	FaUserCog,
	FaUsers,
	FaUserShield,
	FaUserTie,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ManagerTable from "../../components/admin/ManagerTable";
import UserTable from "../../components/admin/UserTable";

const AdminDashboard = ({ adminStats, adminLoading, adminError }) => {
	const [showUsers, setShowUsers] = useState(false);
	const [showManagers, setShowManagers] = useState(false);
	const [users, setUsers] = useState([]);
	const [managers, setManagers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleShowUsers = async () => {
		setShowManagers(false);
		setShowUsers(true);
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("authToken");
			const res = await axios.get(
				`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setUsers(res.data);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to fetch users.");
		} finally {
			setLoading(false);
		}
	};

	const handleShowManagers = async () => {
		setShowUsers(false);
		setShowManagers(true);
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("authToken");
			const res = await axios.get(
				`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			// Filter managers
			const managersList = res.data.filter(
				(u) => u.roles && u.roles.includes("MANAGER")
			);
			// For each manager, fetch subordinates from /api/admin/managed?managerId=...
			const subordinatesPromises = managersList.map(async (manager) => {
				try {
					const subRes = await axios.get(
						`${import.meta.env.VITE_API_BASE_URL}/api/admin/managed?managerId=${
							manager.id
						}`,
						{ headers: { Authorization: `Bearer ${token}` } }
					);
					manager.subordinates = subRes.data;
				} catch {
					manager.subordinates = [];
				}
				return manager;
			});
			const managersWithSubs = await Promise.all(subordinatesPromises);
			setManagers(managersWithSubs);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to fetch managers.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in text-center">
				<h1 className="w-full text-4xl font-extrabold text-primary flex items-center justify-center gap-3">
					<FaUserShield className="text-accent-blue text-5xl drop-shadow" />
					Admin Dashboard
				</h1>
			</div>
			{adminLoading ? (
				<p className="text-accent-blue animate-pulse">
					Loading admin statistics...
				</p>
			) : adminError ? (
				<p className="text-accent-red font-semibold animate-shake">
					{adminError}
				</p>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<button
							onClick={handleShowUsers}
							className="bg-accent-blue p-6 rounded-md border-0 flex flex-col items-center w-full shadow-xl hover:bg-accent-blue transition-all duration-200 group animate-card-pop"
						>
							<span className="mb-2 w-12 h-12 flex items-center justify-center rounded-full bg-primary shadow-lg group-hover:scale-110 transition-transform">
								<FaUsers className="text-2xl text-primary" />
							</span>
							<h3 className="font-bold text-accent-blue text-lg mt-2">
								Total Employees
							</h3>
							<p className="text-3xl font-extrabold text-primary">
								{adminStats?.totalUsers ?? "--"}
							</p>
						</button>
						<button
							onClick={handleShowManagers}
							className="bg-accent-green/40 p-6 rounded-md border-0 flex flex-col items-center w-full shadow-xl hover:bg-accent-green/70 transition-all duration-200 group animate-card-pop"
						>
							<span className="mb-2 w-12 h-12 flex items-center justify-center rounded-full bg-primary shadow-lg group-hover:scale-110 transition-transform">
								<FaUserTie className="text-2xl text-primary" />
							</span>
							<h3 className="font-bold text-accent-green text-lg mt-2">
								Total Managers
							</h3>
							<p className="text-3xl font-extrabold text-primary">
								{adminStats?.roleDistribution?.MANAGER ?? "--"}
							</p>
						</button>
					</div>
					{(showUsers || showManagers) && (
						<div className="my-8 animate-fade-in text-center">
							<button
								onClick={() => {
									setShowUsers(false);
									setShowManagers(false);
								}}
								className="mb-4 px-4 py-2 bg-accent-blue text-primary rounded-md shadow hover:bg-accent-pink transition font-semibold animate-bounce"
							>
								Back to Dashboard
							</button>
							{loading ? (
								<p className="text-accent-blue animate-pulse">Loading...</p>
							) : error ? (
								<p className="text-accent-red font-semibold animate-shake">
									{error}
								</p>
							) : showUsers ? (
								<UserTable users={users} />
							) : showManagers ? (
								<ManagerTable managers={managers} />
							) : null}
						</div>
					)}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
						<button
							onClick={() => navigate("/admin/leave-policies")}
							className="flex flex-col items-center p-6 bg-accent-blue rounded-md border-0 shadow-xl hover:bg-accent-blue transition-all duration-200 group animate-card-pop"
						>
							<span className="mb-2 w-14 h-14 flex items-center justify-center rounded-full bg-yellow-900/100 shadow-lg group-hover:scale-110 transition-transform">
								<FaCalendarPlus className="text-3xl text-primary" />
							</span>
							<span className="font-bold text-lg text-accent-blue mt-2">
								Leave Policies
							</span>
						</button>
						<button
							onClick={() => navigate("/admin/actions?mode=credit-leaves")}
							className="flex flex-col items-center p-6 bg-accent-green/40 rounded-md border-0 shadow-xl hover:bg-accent-green/70 transition-all duration-200 group animate-card-pop"
						>
							<span className="mb-2 w-14 h-14 flex items-center justify-center rounded-full bg-accent-green shadow-lg group-hover:scale-110 transition-transform">
								<FaCoins className="text-3xl text-primary" />
							</span>
							<span className="font-bold text-lg text-accent-green mt-2">
								Credit Leaves
							</span>
						</button>
						<button
							onClick={() => navigate("/admin/update-user-info")}
							className="flex flex-col items-center p-6 bg-accent-blue rounded-md border-0 shadow-xl hover:bg-accent-pink transition-all duration-200 group animate-card-pop"
						>
							<span className="mb-2 w-14 h-14 flex items-center justify-center rounded-full bg-accent-pink shadow-lg group-hover:scale-110 transition-transform hover:bg-accent-blue">
								<FaUserCog className="text-3xl text-primary" />
							</span>
							<span className="font-bold text-lg text-accent-pink mt-2">
								Update User Info
							</span>
						</button>
						<button
							onClick={() => navigate("/admin/reports")}
							className="flex flex-col items-center p-6 bg-primary rounded-md border-0 shadow-xl hover:bg-accent-blue/40 transition-all duration-200 group animate-card-pop"
						>
							<span className="mb-2 w-14 h-14 flex items-center justify-center rounded-full bg-primary shadow-lg group-hover:scale-110 transition-transform border border-accent-blue">
								<FaFileDownload className="text-3xl text-accent-blue" />
							</span>
							<span className="font-bold text-lg text-accent-blue mt-2">
								View & Download Reports
							</span>
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default AdminDashboard;
