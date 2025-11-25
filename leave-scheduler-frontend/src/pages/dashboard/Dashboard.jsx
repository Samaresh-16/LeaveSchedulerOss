// src/pages/dashboard/Dashboard.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaClipboardList, FaUserCircle } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import NotificationButton from "../../components/dashboard/NotificationButton";
import NotificationOverlay from "../../components/dashboard/NotificationOverlay";
import { useAuthStore } from "../../state/authStore";
import AdminDashboard from "./AdminDashboard";
import CommonDashboard from "./CommonDashboard";
import ManagerDashboard from "./ManagerDashboard";

// Modular Admin Logs Button (only for admins and only on admin dashboard tab)
const AdminLogsButton = ({ onClick }) => (
	<button
		onClick={onClick}
		className="flex items-center justify-center px-2 py-2 mt-2 bg-card-bg text-accent-primary rounded-full shadow hover:bg-accent-pink/10 transition-all focus:outline-none w-full"
		title="View Admin Logs"
	>
		<FaClipboardList className="text-2xl" />
	</button>
);

const Dashboard = () => {
	const user = useAuthStore((state) => state.user);
	const logout = useAuthStore((state) => state.logout);
	const navigate = useNavigate();

	// Helper role checks
	const isAdmin =
		Array.isArray(user?.roles) &&
		user.roles.some((r) =>
			typeof r === "string"
				? r.toUpperCase().includes("ADMIN")
				: (r?.name || r?.role || "").toUpperCase().includes("ADMIN")
		);
	const isManager =
		Array.isArray(user?.roles) &&
		user.roles.some((r) =>
			typeof r === "string"
				? r.toUpperCase().includes("MANAGER")
				: (r?.name || r?.role || "").toUpperCase().includes("MANAGER")
		);
	const isEmployee =
		Array.isArray(user?.roles) &&
		user.roles.some((r) =>
			typeof r === "string"
				? r.toUpperCase().includes("EMPLOYEE")
				: (r?.name || r?.role || "").toUpperCase().includes("EMPLOYEE")
		);

	const [greeting, setGreeting] = useState("");
	const [adminStats, setAdminStats] = useState(null);
	const [adminLoading, setAdminLoading] = useState(false);
	const [adminError, setAdminError] = useState("");
	const [activeTab, setActiveTab] = useState("my");

	const [showProfile, setShowProfile] = useState(false);
	const [profile, setProfile] = useState(null);
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileError, setProfileError] = useState("");

	const [showNotifications, setShowNotifications] = useState(false);
	const [unreadNotifications, setUnreadNotifications] = useState([]);
	const [readNotifications, setReadNotifications] = useState([]);
	const [notifLoading, setNotifLoading] = useState(false);
	const [notifAnchor, setNotifAnchor] = useState(null);
	const [unreadCount, setUnreadCount] = useState(0);

	const fetchProfile = async () => {
		setProfileLoading(true);
		setProfileError("");
		try {
			const token = localStorage.getItem("authToken");
			const res = await axios.get(
				`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setProfile(res.data);
			setShowProfile(true);
		} catch {
			setProfileError("Failed to load profile");
		} finally {
			setProfileLoading(false);
		}
	};

	const fetchNotifications = async () => {
		setNotifLoading(true);
		try {
			const token = localStorage.getItem("authToken");
			const [unreadRes, allRes] = await Promise.all([
				axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/notifications/unread`,
					{ headers: { Authorization: `Bearer ${token}` } }
				),
				axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
					headers: { Authorization: `Bearer ${token}` },
				}),
			]);
			setUnreadNotifications(unreadRes.data || []);
			setReadNotifications((allRes.data || []).filter((n) => n.isRead));
			setUnreadCount((unreadRes.data || []).length);
		} catch {
			setUnreadNotifications([]);
			setReadNotifications([]);
			setUnreadCount(0);
		} finally {
			setNotifLoading(false);
		}
	};

	const handleMarkRead = async (id) => {
		const token = localStorage.getItem("authToken");
		await axios.put(
			`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}/read`,
			{},
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		fetchNotifications();
	};

	const handleMarkAllRead = async () => {
		const token = localStorage.getItem("authToken");
		await axios.put(
			`${import.meta.env.VITE_API_BASE_URL}/api/notifications/read-all`,
			{},
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		fetchNotifications();
	};

	const handleNotifClick = (e) => {
		setNotifAnchor(e.currentTarget);
		setShowNotifications((prev) => !prev);
		if (!showNotifications) fetchNotifications();
	};

	useEffect(() => {
		const hours = new Date().getHours();
		let greetingText = "Good ";
		if (hours < 12) greetingText += "Morning";
		else if (hours < 18) greetingText += "Afternoon";
		else greetingText += "Evening";
		setGreeting(greetingText);
	}, []);

	useEffect(() => {
		if (isAdmin) {
			setAdminLoading(true);
			setAdminError("");
			const token = localStorage.getItem("authToken"); // FIXED: use correct key

			const config = {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			};
			axios
				.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard-stats`,
					config
				)
				.then((res) => {
					setAdminStats(res.data);
				})
				.catch((err) => {
					setAdminError(
						err.response?.data?.message || "Failed to load admin statistics."
					);
				})
				.finally(() => setAdminLoading(false));
		}
	}, [isAdmin]);

	useEffect(() => {
		// Always fetch notifications on mount to keep unreadCount in sync
		fetchNotifications();
	}, []);

	return (
		<div className="p-6 min-h-screen bg-gradient-to-br">
			<div className="flex justify-between items-center mb-4">
				<div className="flex items-center gap-4">
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-4">
							<button
								onClick={fetchProfile}
								className="flex items-center gap-2 px-2 py-2 bg-card-bg text-accent-blue rounded-full shadow hover:bg-accent-blue/10 transition-all focus:outline-none"
								title="View Profile"
							>
								<FaUserCircle className="text-2xl text-white" />
							</button>
						</div>
						<div className="flex items-center gap-4">
							{isAdmin && activeTab === "admin" && (
								<AdminLogsButton
									onClick={() => navigate("/admin/audit-logs")}
								/>
							)}
						</div>
					</div>
					<div className="w-full text-lg font-bold bg-white px-5 py-2 rounded-4xl shadow animate-slide-in text-center whitespace-nowrap">
						<span className="uppercase tracking-wide">{greeting}</span>,{" "}
						<span className="text-primary font-extrabold">
							{user?.fullName || "User"}
						</span>
						!
					</div>
				</div>
				<div className="flex-1 flex justify-end items-center gap-4">
					<div className="relative">
							<NotificationButton
								unreadCount={unreadCount}
								onClick={handleNotifClick}
							/>
						{showNotifications && (
							<NotificationOverlay
								anchorRef={{ current: notifAnchor }}
								unreadNotifications={unreadNotifications}
								readNotifications={readNotifications}
								onMarkRead={handleMarkRead}
								onMarkAllRead={handleMarkAllRead}
								onClose={() => setShowNotifications(false)}
								loading={notifLoading}
							/>
						)}
					</div>
					<button
						className="px-4 py-2 bg-accent-pink text-primary rounded-md font-bold shadow hover:bg-accent-blue transition-all animate-bounce flex items-center gap-2"
						onClick={() => {
							logout();
							navigate("/login");
						}}
					>
						<MdOutlineLogout />
						Logout
					</button>
				</div>
			</div>
			<div className="flex flex-col items-center mb-8">
				<img
					src="/leave.png"
					alt="Company Logo"
					className="h-14 mb-2 animate-bounce"
				/>
				<h1 className="text-2xl font-bold tracking-wide text-accent-blue mb-1">
					Leave Scheduler
				</h1>
				<p className="text-sm text-gray-400 font-medium">
					Welcome to your dashboard. Use the tabs below to navigate between your
					personal, admin, and manager views.
				</p>
				{/* Calendar and Holidays Buttons */}
				<div className="w-full flex justify-between mt-2">
					<button
						onClick={() => navigate("/calendar")}
						className="flex items-center gap-2 bg-accent-blue text-white px-4 py-2 rounded shadow hover:bg-accent-pink transition duration-200 font-semibold"
						title="View Calendar"
					>
						<FaCalendarAlt className="text-lg" />
						<span>Calendar</span>
					</button>
					<button
						onClick={() => navigate("/holidays")}
						className="flex items-center gap-2 bg-accent-blue text-white px-4 py-2 rounded shadow hover:bg-accent-pink transition duration-200 font-semibold"
						title="View Holidays"
					>
						<FaCalendarAlt className="text-lg" />
						<span>Holidays</span>
					</button>
				</div>
			</div>
			<div className="bg-card-bg rounded-2xl shadow-md p-6 border border-gray-700/40">
				{/* Enhanced Tabs for Admins and Managers */}
				{(isAdmin || isManager) && (
					<div className="mb-8 flex justify-center gap-6">
						<button
							onClick={() => setActiveTab("my")}
							className={`flex flex-col items-center px-6 py-3 transition-all duration-200 shadow-md border-b-4 ${
								activeTab === "my"
									? "border-accent-blue bg-white/90 scale-105 shadow-lg text-accent-blue"
									: "border-transparent hover:bg-accent-blue/5 hover:scale-105 text-primary"
							} rounded-md focus:outline-none group`}
							style={
								activeTab === "my"
									? {
											outline: "3px solid #00ffff",
											outlineOffset: "2px",
											boxShadow: "0 0 0 4px rgba(0,224,255,0.25)",
											zIndex: 2,
											minWidth: 120,
									  }
									: { minWidth: 120 }
							}
						>
							<span
								className={`text-accent-blue text-xl mb-1 group-hover:animate-bounce`}
							>
								<i className="fa-solid fa-gauge-high"></i>
							</span>
							<span className={`font-semibold text-center text-base `}>
								My Dashboard
							</span>
						</button>
						{isAdmin && (
							<button
								onClick={() => setActiveTab("admin")}
								className={`flex flex-col items-center px-6 py-3 transition-all duration-200 shadow-md border-b-4 ${
									activeTab === "admin"
										? "border-accent-pink bg-white/90 scale-105 shadow-lg text-accent-pink"
										: "border-transparent hover:bg-accent-pink/5 hover:scale-105 text-primary"
								} rounded-md focus:outline-none group`}
								style={
									activeTab === "admin"
										? {
												outline: "3px solid #00ffff",
												outlineOffset: "2px",
												boxShadow: "0 0 0 4px rgba(255,0,224,0.18)",
												zIndex: 2,
												minWidth: 120,
										  }
										: { minWidth: 120 }
								}
							>
								<span
									className={`text-accent-pink text-xl mb-1 group-hover:animate-bounce`}
								>
									<i className="fa-solid fa-user-shield"></i>
								</span>
								<span className={`font-semibold text-center text-base`}>
									Admin Dashboard
								</span>
							</button>
						)}
						{isManager && (
							<button
								onClick={() => setActiveTab("manager")}
								className={`flex flex-col items-center px-6 py-3 transition-all duration-200 shadow-md border-b-4 ${
									activeTab === "manager"
										? "border-accent-green bg-white/90 scale-105 shadow-lg text-accent-green"
										: "border-transparent hover:bg-accent-green/5 hover:scale-105 text-primary"
								} rounded-md focus:outline-none group`}
								style={
									activeTab === "manager"
										? {
												outline: "3px solid #00ffff",
												outlineOffset: "2px",
												boxShadow: "0 0 0 4px rgba(0,255,176,0.18)",
												zIndex: 2,
												minWidth: 120,
										  }
										: { minWidth: 120 }
								}
							>
								<span
									className={`text-accent-green text-xl mb-1 group-hover:animate-bounce`}
								>
									<i className="fa-solid fa-user-tie"></i>
								</span>
								<span className={`font-semibold text-center text-base`}>
									Manager Dashboard
								</span>
							</button>
						)}
					</div>
				)}

				{/* My Dashboard for all users (including Admins/Managers) */}
				{((isAdmin || isManager) && activeTab === "my") ||
				(!isAdmin && !isManager && isEmployee) ? (
					<CommonDashboard user={user} />
				) : null}

				{/* Admin Dashboard */}
				{isAdmin && activeTab === "admin" && (
					<AdminDashboard
						user={user}
						adminStats={adminStats}
						adminLoading={adminLoading}
						adminError={adminError}
					/>
				)}

				{/* Manager Dashboard */}
				{isManager && activeTab === "manager" && (
					<ManagerDashboard user={user} />
				)}
			</div>
			{/* Footer */}
			<div className="mt-8 pt-4 border-t border-gray-700/30 text-center text-xs text-gray-500 font-medium">
				&copy; {new Date().getFullYear()} Leave Scheduler. All rights reserved.
			</div>
			{showProfile && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<div
						className="bg-card-bg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-accent-blue relative animate-fade-in"
						style={{ backgroundColor: "var(--card-bg)" }}
					>
						<button
							onClick={() => setShowProfile(false)}
							className="absolute top-3 right-3 bg-white text-gray-400 hover:text-accent-pink text-xl font-bold"
							aria-label="Close"
						>
							&times;
						</button>
						<h2 className="text-xl font-bold mb-4 text-accent-blue text-center flex items-center gap-2 justify-center">
							<FaUserCircle className="text-2xl" />
							User Profile
						</h2>
						{profileLoading ? (
							<p className="text-accent-blue animate-pulse text-center">
								Loading...
							</p>
						) : profileError ? (
							<p className="text-accent-red text-center">{profileError}</p>
						) : profile ? (
							<div className="space-y-2 text-primary text-base">
								<p>
									<span className="font-semibold">Full Name:</span>{" "}
									{profile.fullName}
								</p>
								<p>
									<span className="font-semibold">Username:</span>{" "}
									{profile.username}
								</p>
								<p>
									<span className="font-semibold">Email:</span> {profile.email}
								</p>
								<p>
									<span className="font-semibold">Department:</span>{" "}
									{profile.department || "-"}
								</p>
								<p>
									<span className="font-semibold">Roles:</span>{" "}
									{profile.roles && Array.isArray(profile.roles)
										? profile.roles.join(", ")
										: "-"}
								</p>
								<p>
									<span className="font-semibold">Manager:</span>{" "}
									{profile.managerName || "-"}
								</p>
								<p>
									<span className="font-semibold">Joining Date:</span>{" "}
									{profile.joiningDate || "-"}
								</p>
								<p>
									<span className="font-semibold">Phone:</span>{" "}
									{profile.phone || "-"}
								</p>
								<p>
									<span className="font-semibold">Emergency Contact:</span>{" "}
									{profile.emergencyContact || "-"}
								</p>
								<p>
									<span className="font-semibold">Active:</span>{" "}
									{profile.active ? "Yes" : "No"}
								</p>
								<p>
									<span className="font-semibold">Last Login:</span>{" "}
									{profile.lastLogin || "-"}
								</p>
								<div className="mt-6 text-center">
									<button
										onClick={() => {
											setShowProfile(false);
											navigate("/users/change-password");
										}}
										className="px-4 py-2 bg-accent-blue text-white rounded shadow hover:bg-accent-pink transition font-semibold"
									>
										Change Password
									</button>
								</div>
							</div>
						) : null}
					</div>
				</div>
			)}
		</div>
	);
};

export default Dashboard;
