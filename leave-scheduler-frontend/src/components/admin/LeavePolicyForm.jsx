import axios from "axios";
import { useEffect, useState } from "react";

// List of LeaveType enum values
const LEAVE_TYPES = [
	"CASUAL",
	"SICK",
	"EARNED",
	"MATERNITY",
	"PATERNITY",
	"BEREAVEMENT",
	"UNPAID",
	"COMPENSATORY",
	"SPECIAL"
];

const USER_ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"];

const LeavePolicyForm = ({ policy, onSuccess, onCancel }) => {
	const [form, setForm] = useState(() => {
		if (policy) {
			return {
				...policy,
				leaveType: policy.leaveType || "",
				minDuration: policy.minDuration || "",
				maxDuration: policy.maxDuration || "",
				noticeRequired: policy.noticeRequired || "",
				applicableRoles: policy.applicableRoles || [],
			};
		} else {
			return {
				leaveType: "",
				description: "",
				annualCredit: "",
				maxAccumulation: "",
				isCarryForward: false,
				isActive: true,
				minDuration: "",
				maxDuration: "",
				noticeRequired: "",
				applicableRoles: [],
			};
		}
	});

	// Reset form when policy prop changes (e.g., when clicking Update)
	useEffect(() => {
		if (policy) {
			setForm({
				...policy,
				leaveType: policy.leaveType || "",
				minDuration: policy.minDuration || "",
				maxDuration: policy.maxDuration || "",
				noticeRequired: policy.noticeRequired || "",
				applicableRoles: policy.applicableRoles || [],
			});
		} else {
			setForm({
				leaveType: "",
				description: "",
				annualCredit: "",
				maxAccumulation: "",
				isCarryForward: false,
				isActive: true,
				minDuration: "",
				maxDuration: "",
				noticeRequired: "",
				applicableRoles: [],
			});
		}
	}, [policy]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showRolesDropdown, setShowRolesDropdown] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		// Prevent changing leaveType if editing
		if (name === "leaveType" && policy) return;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("authToken");
			// For each field, use form value if present, else fallback to policy value
			const payload = {
				leaveType: policy ? policy.leaveType : form.leaveType,
				description:
					form.description !== undefined && form.description !== ""
						? form.description
						: policy?.description || "",
				annualCredit:
					form.annualCredit !== undefined && form.annualCredit !== ""
						? form.annualCredit
						: policy?.annualCredit || "",
				maxAccumulation:
					form.maxAccumulation !== undefined && form.maxAccumulation !== ""
						? form.maxAccumulation
						: policy?.maxAccumulation || "",
				isCarryForward:
					typeof form.isCarryForward === "boolean"
						? form.isCarryForward
						: policy?.isCarryForward || false,
				isActive:
					typeof form.isActive === "boolean"
						? form.isActive
						: policy?.isActive || true,
				minDuration:
					form.minDuration !== undefined && form.minDuration !== ""
						? form.minDuration
						: policy?.minDuration || "",
				maxDuration:
					form.maxDuration !== undefined && form.maxDuration !== ""
						? form.maxDuration
						: policy?.maxDuration || "",
				noticeRequired:
					form.noticeRequired !== undefined && form.noticeRequired !== ""
						? form.noticeRequired
						: policy?.noticeRequired || "",
				applicableRoles:
					form.applicableRoles && form.applicableRoles.length > 0
						? form.applicableRoles
						: policy?.applicableRoles || [],
				...(policy && policy.id ? { id: policy.id } : {}),
			};
			await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}/api/admin/leave-policies`,
				payload,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			onSuccess();
			// Always reset form fields to blank after success (create or update)
			setForm({
				leaveType: "",
				description: "",
				annualCredit: "",
				maxAccumulation: "",
				isCarryForward: false,
				isActive: true,
				minDuration: "",
				maxDuration: "",
				noticeRequired: "",
				applicableRoles: [],
			});
		} catch (err) {
			setError(err.response?.data?.message || "Failed to save policy.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white p-6 rounded-lg shadow border mb-8 max-w-xl mx-auto"
		>
			<h2 className="text-xl font-semibold mb-4">
				{policy ? "Edit" : "Create"} Leave Policy
			</h2>

			{error && <p className="text-red-600 mb-2">{error}</p>}
			<div className="mb-3">
				<label className="block mb-1 font-medium">Leave Type</label>
				<select
					name="leaveType"
					value={policy ? policy.leaveType : form.leaveType}
					onChange={handleChange}
					className="border rounded px-3 py-2 w-full"
					required
					disabled={!!policy}
				>
					<option value="">Select Leave Type</option>
					{LEAVE_TYPES.map((type) => (
						<option key={type} value={type}>
							{type.charAt(0) + type.slice(1).toLowerCase()}
						</option>
					))}
				</select>
			</div>
			<div className="mb-3">
				<label className="block mb-1 font-medium">Description</label>
				<textarea
					name="description"
					value={form.description}
					onChange={handleChange}
					className="border rounded px-3 py-2 w-full"
					required
				/>
			</div>
			<div className="mb-3">
				<label className="block mb-1 font-medium">Annual Credit</label>
				<input
					type="number"
					name="annualCredit"
					value={form.annualCredit}
					onChange={handleChange}
					className="border rounded px-3 py-2 w-full"
					required
					min="0"
				/>
			</div>
			<div className="mb-3">
				<label className="block mb-1 font-medium">Max Accumulation</label>
				<input
					type="number"
					name="maxAccumulation"
					value={form.maxAccumulation}
					onChange={handleChange}
					className="border rounded px-3 py-2 w-full"
					min="0"
				/>
			</div>
			<div className="mb-3">
				<label className="block mb-1 font-medium">Min Duration (days)</label>
				<input
					type="number"
					name="minDuration"
					value={form.minDuration}
					onChange={handleChange}
					className="border rounded px-3 py-2 w-full"
					min="0"
				/>
			</div>
			<div className="mb-3">
				<label className="block mb-1 font-medium">Max Duration (days)</label>
				<input
					type="number"
					name="maxDuration"
					value={form.maxDuration}
					onChange={handleChange}
					className="border rounded px-3 py-2 w-full"
					min="0"
				/>
			</div>
			<div className="mb-3">
				<label className="block mb-1 font-medium">Notice Required (days)</label>
				<input
					type="number"
					name="noticeRequired"
					value={form.noticeRequired}
					onChange={handleChange}
					className="border rounded px-3 py-2 w-full"
					min="0"
				/>
			</div>
			<div className="mb-3 relative">
				<label className="block mb-1 font-medium">Applicable Roles</label>
				<div
					tabIndex={0}
					className="border rounded px-3 py-2 w-full cursor-pointer select-none focus:outline-none"
					onClick={(e) => {
						if (e.target === e.currentTarget) setShowRolesDropdown((v) => !v);
					}}
					onBlur={() => setShowRolesDropdown(false)}
				>
					<span>
						{form.applicableRoles && form.applicableRoles.length > 0
							? form.applicableRoles.join(", ")
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
										setForm((prev) => {
											const roles = new Set(prev.applicableRoles || []);
											if (
												prev.applicableRoles &&
												prev.applicableRoles.includes(role)
											) {
												roles.delete(role);
											} else {
												roles.add(role);
											}
											return { ...prev, applicableRoles: Array.from(roles) };
										});
									}}
								>
									<input
										type="checkbox"
										checked={
											form.applicableRoles &&
											form.applicableRoles.includes(role)
										}
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
			<div className="mb-3 flex items-center gap-4">
				<label className="font-medium">Carry Forward</label>
				<input
					type="checkbox"
					name="isCarryForward"
					checked={form.isCarryForward}
					onChange={handleChange}
				/>
			</div>
			<div className="mb-3 flex items-center gap-4">
				<label className="font-medium">Active</label>
				<input
					type="checkbox"
					name="isActive"
					checked={form.isActive}
					onChange={handleChange}
				/>
			</div>
			<div className="flex gap-4 mt-4">
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
					disabled={loading}
				>
					{loading ? "Saving..." : policy ? "Update Policy" : "Create Policy"}
				</button>
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
					>
						Cancel
					</button>
				)}
			</div>
		</form>
	);
};

export default LeavePolicyForm;
