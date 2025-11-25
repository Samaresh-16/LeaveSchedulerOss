import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordStrengthIndicator from "../../components/auth/PasswordStrengthIndicator";
import { useAuthStore } from "../../state/authStore";

const ChangePassword = () => {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const logout = useAuthStore((state) => state.logout);
	const navigate = useNavigate();

	const validate = () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			setError("All fields are required.");
			return false;
		}
		if (newPassword.length < 6) {
			setError("New password must be at least 6 characters.");
			return false;
		}
		if (newPassword !== confirmPassword) {
			setError("New password and confirm password do not match.");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		if (!validate()) return;
		setLoading(true);
		try {
			const token = localStorage.getItem("authToken");
			await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}/api/auth/change-password`,
				{
					currentPassword,
					newPassword,
					confirmPassword,
				},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setSuccess("Password changed successfully. Logging out...");
			setTimeout(() => {
				logout();
				navigate("/login");
			}, 1500);
		} catch (err) {
			setError(
				err.response?.data?.message ||
					"Failed to change password. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent-blue/10 to-accent-pink/10 p-4">
			<div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-accent-blue">
				<h2 className="text-2xl font-bold text-accent-blue mb-6 text-center">
					Change Password
				</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">
							Current Password
						</label>
						<input
							type="password"
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							New Password
						</label>
						<input
							type="password"
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
						/>
						<PasswordStrengthIndicator password={newPassword} />
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">
							Confirm New Password
						</label>
						<input
							type="password"
							className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>
					{error && (
						<div className="text-accent-red text-sm text-center">{error}</div>
					)}
					{success && (
						<div className="text-accent-green text-sm text-center">
							{success}
						</div>
					)}
					<button
						type="submit"
						className="w-full py-2 px-4 bg-accent-blue text-white rounded font-semibold shadow hover:bg-accent-pink transition disabled:opacity-60"
						disabled={loading}
					>
						{loading ? "Changing..." : "Change Password"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ChangePassword;
