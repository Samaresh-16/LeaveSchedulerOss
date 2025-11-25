import React, { useState, useEffect } from "react";
import { FaSignInAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import useFormValidation from "../../hooks/useFormValidation";
import { useAuthStore } from "../../state/authStore";

const Login = () => {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);
	const [isLoading, setIsLoading] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [loginError, setLoginError] = useState("");

	// Form validation
	const validateLoginForm = (values) => {
		const errors = {};

		if (!values.username) {
			errors.username = "Username is required";
		}

		if (!values.password) {
			errors.password = "Password is required";
		}

		return errors;
	};

	const { values, errors, touched, handleChange, handleBlur, validateForm } =
		useFormValidation({ username: "", password: "" }, validateLoginForm);

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate form
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setLoginError("");

		try {
			const loginData = {
				username: values.username,
				password: values.password,
			};

			// Store remember me preference
			if (rememberMe) {
				localStorage.setItem("rememberUser", values.username);
			} else {
				localStorage.removeItem("rememberUser");
			}

			// Await login and extract user info from JwtResponse
			await login(loginData);

			// If the login returns a DTO (JwtResponse), manually set user in Zustand

			navigate("/dashboard");
		} catch (err) {
			setLoginError(err.message || "Login failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	// Check for remembered user on component mount
	useEffect(() => {
		const rememberedUser = localStorage.getItem("rememberUser");
		if (rememberedUser) {
			setRememberMe(true);
			handleChange({ target: { name: "username", value: rememberedUser } });
		}
	}, []);

	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#1a2636]">
			<div className="w-full max-w-md px-8 py-10 bg-card-bg rounded-2xl shadow-2xl animate-fade-in border border-gray-700/40">
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
						Welcome back! Please sign in to continue.
					</p>
				</div>

				<h2 className="mb-6 text-xl font-semibold text-center text-primary flex items-center justify-center gap-2">
					<FaSignInAlt className="text-accent-blue text-xl" />
					Login
				</h2>

				{loginError && (
					<div
						className="p-3 mb-4 text-sm text-accent-red bg-accent-red/10 rounded-lg border border-accent-red/30 animate-shake"
						role="alert"
					>
						{loginError}
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="mb-5">
						<label
							htmlFor="username"
							className="block mb-2 text-sm font-semibold text-primary"
						>
							Username
						</label>
						<input
							type="text"
							id="username"
							name="username"
							value={values.username}
							onChange={handleChange}
							onBlur={handleBlur}
							className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue bg-input-bg text-primary transition-all ${
								errors.username && touched.username
									? "border-accent-red"
									: "border-gray-700 focus:border-accent-blue"
							}`}
							placeholder="Enter your username"
							disabled={isLoading}
						/>
						{errors.username && touched.username && (
							<p className="mt-1 text-xs text-accent-red font-medium animate-shake">
								{errors.username}
							</p>
						)}
					</div>

					<div className="mb-5">
						<label
							htmlFor="password"
							className="block mb-2 text-sm font-semibold text-primary"
						>
							Password
						</label>
						<input
							type="password"
							id="password"
							name="password"
							value={values.password}
							onChange={handleChange}
							onBlur={handleBlur}
							className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue bg-input-bg text-primary transition-all ${
								errors.password && touched.password
									? "border-accent-red"
									: "border-gray-700 focus:border-accent-blue"
							}`}
							placeholder="Enter your password"
							disabled={isLoading}
						/>
						{errors.password && touched.password && (
							<p className="mt-1 text-xs text-accent-red font-medium animate-shake">
								{errors.password}
							</p>
						)}
					</div>

					<div className="flex items-center justify-between mb-7">
						<div className="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								checked={rememberMe}
								onChange={() => setRememberMe(!rememberMe)}
								className="w-4 h-4 text-accent-blue border-gray-400 rounded focus:ring-accent-blue"
							/>
							<label
								htmlFor="remember-me"
								className="block ml-2 text-xs text-gray-400 font-medium"
							>
								Remember me
							</label>
						</div>

						<div className="text-xs">
							<Link
								to="/forgot-password"
								className="text-accent-blue hover:text-accent-pink font-semibold transition-colors"
							>
								Forgot password?
							</Link>
						</div>
					</div>

					<button
						type="submit"
						className={`w-full px-4 py-2 text-primary bg-accent-blue rounded-lg hover:bg-accent-pink focus:outline-none focus:ring-2 focus:ring-accent-blue font-semibold shadow transition-all text-base tracking-wide ${
							isLoading ? "opacity-70 cursor-not-allowed" : ""
						}`}
						disabled={isLoading}
					>
						{isLoading ? (
							<span className="flex items-center justify-center">
								<svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Logging in...
							</span>
						) : (
							"Log In"
						)}
					</button>

					<p className="mt-6 text-xs text-center text-gray-400 font-medium">
						Don't have an account?{" "}
						<Link
							to="/register"
							className="text-accent-blue hover:text-accent-pink font-semibold transition-colors"
						>
							Register
						</Link>
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

export default Login;
