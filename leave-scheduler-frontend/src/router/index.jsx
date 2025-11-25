// src/router/index.jsx
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import UpdateUserInfo from "../components/admin/UpdateUserInfo";
import AdminActionsPage from "../pages/admin/AdminActionsPage";
import AdminAuditLogsPage from "../pages/admin/AdminAuditLogsPage";
import LeavePolicyPage from "../pages/admin/LeavePolicyPage";
import ReportsPage from "../pages/admin/ReportsPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ResetPassword from "../pages/auth/ResetPassword";
import CalendarPage from "../pages/dashboard/CalendarPage";
import Dashboard from "../pages/dashboard/Dashboard"; // Placeholder, will implement later
import HolidaysPage from "../pages/holidays/HolidaysPage";
import ApplyLeave from "../pages/leaves/ApplyLeave";
import LeaveApplications from "../pages/leaves/LeaveApplications";
import ChangePassword from "../pages/users/ChangePassword";
import { useAuthStore } from "../state/authStore";

const AppRouter = () => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
				/>
				<Route
					path="/login"
					element={isAuthenticated ? <Dashboard /> : <Login />}
				/>
				<Route
					path="/register"
					element={isAuthenticated ? <Dashboard /> : <Register />}
				/>
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route
					path="/dashboard"
					element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
				/>
				<Route
					path="/leave-applications"
					element={
						isAuthenticated ? <LeaveApplications /> : <Navigate to="/login" />
					}
				/>
				<Route
					path="/leaves/apply"
					element={isAuthenticated ? <ApplyLeave /> : <Navigate to="/login" />}
				/>
				<Route
					path="/admin/leave-policies"
					element={
						isAuthenticated ? <LeavePolicyPage /> : <Navigate to="/login" />
					}
				/>
				<Route
					path="/admin/reports"
					element={isAuthenticated ? <ReportsPage /> : <Navigate to="/login" />}
				/>
				<Route
					path="/admin/actions"
					element={
						isAuthenticated ? <AdminActionsPage /> : <Navigate to="/login" />
					}
				/>
				<Route
					path="/admin/update-user-info"
					element={
						isAuthenticated ? <UpdateUserInfo /> : <Navigate to="/login" />
					}
				/>
				<Route
					path="/admin/audit-logs"
					element={
						isAuthenticated ? <AdminAuditLogsPage /> : <Navigate to="/login" />
					}
				/>
				<Route
					path="/users/change-password"
					element={
						isAuthenticated ? <ChangePassword /> : <Navigate to="/login" />
					}
				/>
				<Route
					path="/holidays"
					element={
						isAuthenticated ? <HolidaysPage /> : <Navigate to="/login" />
					}
				/>
				<Route
					path="/calendar"
					element={
						isAuthenticated ? <CalendarPage /> : <Navigate to="/login" />
					}
				/>
			</Routes>
		</Router>
	);
};

export default AppRouter;
