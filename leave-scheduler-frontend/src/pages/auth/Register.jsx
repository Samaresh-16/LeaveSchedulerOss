import axios from "axios";
import { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PasswordStrengthIndicator from "../../components/auth/PasswordStrengthIndicator";

const Register = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		roles: ["EMPLOYEE"],
		department: "",
		joiningDate: "",
		phone: "",
		emergencyContact: "",
	});
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const validate = () => {
		if (!formData.fullName.trim()) return "Full name is required";
		if (!formData.username.trim()) return "Username is required";
		if (!formData.email.trim()) return "Email is required";
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email))
			return "Invalid email format";
		if (!formData.password) return "Password is required";
		if (formData.password.length < 6)
			return "Password must be at least 6 characters";
		if (formData.password !== formData.confirmPassword)
			return "Passwords do not match";
		return null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		const validationError = validate();
		if (validationError) {
			setError(validationError);
			return;
		}
		setIsLoading(true);
		try {
			const payload = {
				fullName: formData.fullName,
				username: formData.username,
				email: formData.email,
				password: formData.password,
				roles: formData.roles.length > 0 ? formData.roles : undefined,
				department: formData.department || undefined,
				joiningDate: formData.joiningDate || undefined,
				phone: formData.phone || undefined,
				emergencyContact: formData.emergencyContact || undefined,
			};
			await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
				payload
			);
			navigate("/login");
		} catch (err) {
			setError(
				err.response?.data?.message ||
					err.response?.data?.error ||
					"Registration failed"
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#1a2636]">
			<div className="w-full max-w-xl px-8 py-10 bg-card-bg rounded-2xl shadow-2xl animate-fade-in border border-gray-700/40">
				{/* Company Logo or Name */}
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
						Create your account to get started.
					</p>
				</div>

				<h2 className="text-xl font-semibold text-center text-primary flex items-center justify-center gap-2 mb-6">
					<FaUserPlus className="text-accent-blue text-xl" />
					Register
				</h2>
				{error && (
					<p className="text-accent-red mb-4 font-medium text-center animate-shake">
						{error}
					</p>
				)}
				<form onSubmit={handleSubmit}>
					<input
						name="fullName"
						placeholder="Full Name"
						value={formData.fullName}
						onChange={handleChange}
						className="w-full mb-4 p-3 border rounded-lg bg-input-bg text-primary border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue font-medium text-base transition-all"
						required
					/>
					<input
						name="username"
						placeholder="Username"
						value={formData.username}
						onChange={handleChange}
						className="w-full mb-4 p-3 border rounded-lg bg-input-bg text-primary border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue font-medium text-base transition-all"
						required
					/>
					<input
						name="email"
						type="email"
						placeholder="Email"
						value={formData.email}
						onChange={handleChange}
						className="w-full mb-4 p-3 border rounded-lg bg-input-bg text-primary border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue font-medium text-base transition-all"
						required
					/>
					<input
						name="department"
						placeholder="Department"
						value={formData.department}
						onChange={handleChange}
						className="w-full mb-4 p-3 border rounded-lg bg-input-bg text-primary border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue font-medium text-base transition-all"
					/>
					<label
						className="block mb-2 text-sm font-semibold text-primary mt-2"
						htmlFor="joiningDate"
					>
						Date of Joining{" "}
						<span className="text-xs text-accent-blue">(DD-MM-YYYY)</span>
					</label>
					<input
						name="joiningDate"
						type="date"
						placeholder="YYYY-MM-DD"
						value={formData.joiningDate}
						onChange={handleChange}
						className="w-full mb-4 p-3 border rounded-lg bg-input-bg text-primary border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue font-medium text-base transition-all"
					/>
					<input
						name="phone"
						placeholder="Phone"
						value={formData.phone}
						onChange={handleChange}
						className="w-full mb-4 p-3 border rounded-lg bg-input-bg text-primary border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue font-medium text-base transition-all"
					/>
					<input
						name="emergencyContact"
						placeholder="Emergency Contact"
						value={formData.emergencyContact}
						onChange={handleChange}
						className="w-full mb-4 p-3 border rounded-lg bg-input-bg text-primary border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue font-medium text-base transition-all"
					/>
					<input
						name="password"
						type="password"
						placeholder="Password"
						value={formData.password}
						onChange={handleChange}
						className="w-full mb-4 p-3 border rounded-lg bg-input-bg text-primary border-accent-pink focus:outline-none focus:ring-2 focus:ring-accent-pink font-medium text-base transition-all"
						required
					/>
					<PasswordStrengthIndicator password={formData.password} />
					<input
						name="confirmPassword"
						type="password"
						placeholder="Confirm Password"
						value={formData.confirmPassword}
						onChange={handleChange}
						className="w-full mb-6 p-3 border rounded-lg bg-input-bg text-primary border-accent-pink focus:outline-none focus:ring-2 focus:ring-accent-pink font-medium text-base transition-all"
						required
					/>
					<button
						type="submit"
						className={`w-full px-4 py-2 text-primary bg-accent-green rounded-lg hover:bg-accent-pink focus:outline-none focus:ring-2 focus:ring-accent-green font-semibold shadow transition-all text-base tracking-wide mt-2 ${
							isLoading ? "opacity-70 cursor-not-allowed" : ""
						}`}
						disabled={isLoading}
					>
						{isLoading ? "Registering..." : "Register"}
					</button>
					<p className="mt-6 text-xs text-center text-gray-400 font-medium">
						Already have an account?{" "}
						<a
							href="/login"
							className="text-accent-blue hover:text-accent-pink font-semibold transition-colors"
						>
							Back to Login
						</a>
					</p>
				</form>
				{/* Footer */}
				<div className="mt-8 pt-4 border-t border-gray-700/30 text-center text-xs text-gray-500 font-medium">
					&copy; {new Date().getFullYear()} Leave Scheduler. All rights
					reserved.
				</div>
			</div>
		</div>
	);
};

export default Register;
