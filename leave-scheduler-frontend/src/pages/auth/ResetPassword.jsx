import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordStrengthIndicator from "../../components/auth/PasswordStrengthIndicator";

const ResetPassword = () => {
	const navigate = useNavigate();
	const { search } = useLocation();
	const params = new URLSearchParams(search);
	const token = params.get("token");

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage("");
		setError("");
		if (!token) {
			setError("Invalid or missing reset token.");
			return;
		}
		if (!newPassword || !confirmPassword) {
			setError("Please fill in all fields.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		setIsLoading(true);
		try {
			const res = await fetch(
				`${
					import.meta.env.VITE_API_BASE_URL
				}/api/auth/reset-password?token=${encodeURIComponent(
					token
				)}&newPassword=${encodeURIComponent(newPassword)}`,
				{
					method: "POST",
				}
			);
			const data = await res.json();
			if (res.ok && data.success) {
				setMessage("Password reset successfully. You can now log in.");
				setTimeout(() => navigate("/login"), 2000);
			} else {
				setError(data.message || "Failed to reset password.");
			}
		} catch (err) {
			setError("Something went wrong. Please try again.", err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#1a2636]">
			<div className="w-full max-w-md px-8 py-10 bg-card-bg rounded-2xl shadow-2xl animate-fade-in border border-gray-700/40">
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
						Set your new password below.
					</p>
				</div>
				<h2 className="mb-6 text-xl font-semibold text-center text-primary">
					Reset Password
				</h2>
				{message && (
					<div
						className="p-2.5 mb-4 text-sm text-primary bg-accent-green rounded-4xl border border-green-300/2 animate-fade-in"
						role="alert"
					>
						{message}
					</div>
				)}
				{error && (
					<div
						className="p-3 mb-4 text-sm text-accent-red bg-accent-red rounded-4xl border border-accent-red/30 animate-shake"
						role="alert"
					>
						{error}
					</div>
				)}
				<form onSubmit={handleSubmit}>
					<div className="mb-5">
						<label
							htmlFor="newPassword"
							className="block mb-2 text-sm font-semibold text-primary"
						>
							New Password
						</label>
						<input
							type="password"
							id="newPassword"
							name="newPassword"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue bg-input-bg text-primary border-gray-700 focus:border-accent-blue"
							placeholder="Enter new password"
							required
							disabled={isLoading}
						/>
						<PasswordStrengthIndicator password={newPassword} />
					</div>
					<div className="mb-5">
						<label
							htmlFor="confirmPassword"
							className="block mb-2 text-sm font-semibold text-primary"
						>
							Confirm Password
						</label>
						<input
							type="password"
							id="confirmPassword"
							name="confirmPassword"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue bg-input-bg text-primary border-gray-700 focus:border-accent-blue"
							placeholder="Confirm new password"
							required
							disabled={isLoading}
						/>
					</div>
					<button
						type="submit"
						className={`w-full px-4 py-2 text-primary bg-accent-blue rounded-lg hover:bg-accent-pink focus:outline-none focus:ring-2 focus:ring-accent-blue font-semibold shadow transition-all text-base tracking-wide ${
							isLoading ? "opacity-70 cursor-not-allowed" : ""
						}`}
						disabled={isLoading}
					>
						{isLoading ? "Resetting..." : "Reset Password"}
					</button>
				</form>
				<div className="mt-6 text-xs text-center text-gray-400 font-medium">
					<Link
						to="/login"
						className="text-accent-blue hover:text-accent-pink font-semibold transition-colors"
					>
						Back to Login
					</Link>
				</div>
				<div className="mt-8 pt-4 border-t border-gray-700/30 text-center text-xs text-gray-500 font-medium">
					&copy; {new Date().getFullYear()} Leave Scheduler. All rights
					reserved.
				</div>
			</div>
		</div>
	);
};

export default ResetPassword;
