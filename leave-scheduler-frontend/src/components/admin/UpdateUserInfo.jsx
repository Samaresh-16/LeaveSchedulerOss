import axios from "axios";
import { useEffect, useState } from "react";

const USER_ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"];

const UpdateUserInfo = () => {
	const [username, setUsername] = useState("");
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showRolesDropdown, setShowRolesDropdown] = useState(false);
	const [managerInfo, setManagerInfo] = useState(null);

	const handleSearch = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const token = localStorage.getItem("authToken");
			const res = await axios.get(
				`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			const found = res.data.find((u) => u.username === username);
			if (!found) throw new Error("User not found");
			setUser(found);
		} catch (err) {
			setError(
				err.response?.data?.message || err.message || "Failed to fetch user."
			);
		} finally {
			setLoading(false);
		}
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const token = localStorage.getItem("authToken");
			await axios.put(
				`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${user.id}`,
				user,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setSuccess("User updated successfully.");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to update user.");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUser((prev) => ({ ...prev, [name]: value }));
	};

	// Fetch manager info when user.managerId changes
	useEffect(() => {
		const fetchManager = async () => {
			if (user && user.managerId) {
				try {
					const token = localStorage.getItem("authToken");
					const res = await axios.get(
						`${import.meta.env.VITE_API_BASE_URL}/api/admin/users`,
						{ headers: { Authorization: `Bearer ${token}` } }
					);
					const found = res.data.find((u) => u.id === Number(user.managerId));
					setManagerInfo(
						found ? `${found.fullName} (${found.username})` : null
					);
				} catch {
					setManagerInfo(null);
				}
			} else {
				setManagerInfo(null);
			}
		};
		fetchManager();
	}, [user]);

	// After successful update, hide the user form and clear the search field
	useEffect(() => {
		if (success) {
			setUser(null);
			setUsername("");
		}
	}, [success]);

	return (
		<div className="bg-white p-6 rounded-lg shadow border max-w-xl mx-auto mb-8 mt-8">
			<h2 className="text-xl font-semibold mb-4">Update User Info</h2>
			{error && <p className="text-red-600 mb-2">{error}</p>}
			{success && <p className="text-green-600 mb-2">{success}</p>}
			<form onSubmit={handleSearch} className="mb-4 flex gap-2">
				<input
					type="text"
					placeholder="Enter username"
					value={username}
					onChange={(e) => {
						setUsername(e.target.value);
						setUser(null); // Hide details form when username changes
					}}
					className="border rounded px-3 py-2 flex-1"
					required
				/>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
					disabled={loading}
				>
					Search
				</button>
			</form>
			{user && (
				<form onSubmit={handleUpdate} className="space-y-3">
					<div>
						<label className="block mb-1 font-medium">Full Name</label>
						<input
							type="text"
							name="fullName"
							value={user.fullName}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full"
							required
						/>
					</div>
					<div>
						<label className="block mb-1 font-medium">Department</label>
						<input
							type="text"
							name="department"
							value={user.department}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full"
						/>
					</div>
					<div className="relative mb-3">
						<label className="block mb-1 font-medium">Roles</label>
						<div
							tabIndex={0}
							className="border rounded px-3 py-2 w-full cursor-pointer select-none focus:outline-none"
							onClick={(e) => {
								if (e.target === e.currentTarget)
									setShowRolesDropdown((v) => !v);
							}}
							onBlur={() => setShowRolesDropdown(false)}
						>
							<span>
								{user.roles && user.roles.length > 0
									? user.roles.join(", ")
									: "Select roles"}
							</span>
							<span className="float-right">&#9662;</span>
							{showRolesDropdown && (
								<div
									className="absolute left-0 right-0 bg-white border rounded shadow z-10 mt-2"
									onMouseDown={(e) => e.stopPropagation()}
								>
									{USER_ROLES.map((role) => (
										<label
											key={role}
											className="flex items-center px-3 py-2 hover:bg-gray-900 cursor-pointer"
											onClick={(e) => {
												e.preventDefault();
												setUser((prev) => {
													const roles = new Set(prev.roles || []);
													if (prev.roles && prev.roles.includes(role)) {
														roles.delete(role);
													} else {
														roles.add(role);
													}
													return { ...prev, roles: Array.from(roles) };
												});
											}}
										>
											<input
												type="checkbox"
												checked={user.roles && user.roles.includes(role)}
												readOnly
												className="mr-2 pointer-events-none"
											/>
											{role.charAt(0) + role.slice(1).toLowerCase()}
										</label>
									))}
								</div>
							)}
						</div>
					</div>
					<div>
						<label className="block mb-1 font-medium">Manager ID</label>
						<input
							type="number"
							name="managerId"
							value={user.managerId || ""}
							onChange={handleChange}
							className="border rounded px-3 py-2 w-full"
							min="1"
							required
						/>
						{managerInfo && (
							<p className="text-sm text-gray-600 mt-1">
								Manager: {managerInfo}
							</p>
						)}
					</div>
					<div>
						<label className="block mb-1 font-medium">Active</label>
						{(() => {
							const isUserActive =
								user.isActive !== undefined ? user.isActive : user.active;
							return (
								<>
									<button
										type="button"
										onClick={() =>
											setUser((prev) => ({
												...prev,
												isActive: !isUserActive,
											}))
										}
										className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
											isUserActive ? "bg-accent-green" : "bg-accent-red"
										}`}
									>
										<span
											className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-300 ${
												isUserActive ? "translate-x-6" : "translate-x-0"
											}`}
										/>
									</button>
								</>
							);
						})()}
					</div>
					<button
						type="submit"
						className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
						disabled={loading}
					>
						{loading ? "Updating..." : "Update User"}
					</button>
				</form>
			)}
		</div>
	);
};

export default UpdateUserInfo;
