import axios from "axios";
import { useState } from "react";

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

const CreditLeaves = () => {
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	// Special leave form state
	const [specialUserIds, setSpecialUserIds] = useState("");
	const [specialLeaveType, setSpecialLeaveType] = useState("");
	const [specialAmount, setSpecialAmount] = useState("");
	const [specialReason, setSpecialReason] = useState("");
	const [specialMessage, setSpecialMessage] = useState("");
	const [specialError, setSpecialError] = useState("");

	const handleCredit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		setError("");
		try {
			const token = localStorage.getItem("authToken");
			const res = await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}/api/admin/credit-leaves`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setMessage(res.data.message || "Leaves credited successfully.");
		} catch (err) {
			setError(err.response?.data?.message || "Failed to credit leaves.");
		} finally {
			setLoading(false);
		}
	};

	const handleSpecialCredit = async (e) => {
		e.preventDefault();
		setSpecialMessage("");
		setSpecialError("");
		setLoading(true);
		try {
			const token = localStorage.getItem("authToken");
			const params = new URLSearchParams();
			// Accept comma-separated user IDs, trim and filter empty
			const userIdsArr = specialUserIds
				.split(",")
				.map((id) => id.trim())
				.filter(Boolean);
			userIdsArr.forEach((id) => params.append("userIds", id));
			params.append("leaveType", specialLeaveType);
			params.append("amount", specialAmount);
			params.append("reason", specialReason);
			await axios.post(
				`${
					import.meta.env.VITE_API_BASE_URL
				}/api/admin/credit-special-leave?${params.toString()}`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setSpecialMessage("Special leave credited successfully.");
			setSpecialUserIds("");
			setSpecialLeaveType("");
			setSpecialAmount("");
			setSpecialReason("");
		} catch (err) {
			setSpecialError(
				err.response?.data?.message || "Failed to credit special leave."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow border max-w-xl mx-auto mb-8">
			<h2 className="text-xl font-semibold mb-4">
				Credit Annual Leaves to All Users
			</h2>
			{message && <p className="text-green-600 mb-2">{message}</p>}
			{error && <p className="text-red-600 mb-2">{error}</p>}
			<form onSubmit={handleCredit} className="mb-8">
				<button
					type="submit"
					className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
					disabled={loading}
				>
					{loading ? "Crediting..." : "Credit Annual Leaves"}
				</button>
			</form>

			<h2 className="text-xl font-semibold mb-4">
				Credit Special Leave to Users
			</h2>
			{specialMessage && (
				<p className="text-green-600 mb-2">{specialMessage}</p>
			)}
			{specialError && <p className="text-red-600 mb-2">{specialError}</p>}
			<form onSubmit={handleSpecialCredit}>
				<div className="mb-3">
					<label className="block mb-1 font-medium">
						User IDs (comma separated)
					</label>
					<input
						type="text"
						value={specialUserIds}
						onChange={(e) => setSpecialUserIds(e.target.value)}
						className="border rounded px-3 py-2 w-full"
						required
						placeholder="e.g. 101, 102, 103"
					/>
				</div>
				<div className="mb-3">
					<label className="block mb-1 font-medium">Leave Type</label>
					<select
						value={specialLeaveType}
						onChange={(e) => setSpecialLeaveType(e.target.value)}
						className="border rounded px-3 py-2 w-full"
						required
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
					<label className="block mb-1 font-medium">Amount</label>
					<input
						type="number"
						value={specialAmount}
						onChange={(e) => setSpecialAmount(e.target.value)}
						className="border rounded px-3 py-2 w-full"
						required
						min="0"
					/>
				</div>
				<div className="mb-3">
					<label className="block mb-1 font-medium">Reason</label>
					<input
						type="text"
						value={specialReason}
						onChange={(e) => setSpecialReason(e.target.value)}
						className="border rounded px-3 py-2 w-full"
						required
						placeholder="Reason for special leave credit"
					/>
				</div>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
					disabled={loading}
				>
					{loading ? "Crediting..." : "Credit Special Leave"}
				</button>
			</form>
		</div>
	);
};

export default CreditLeaves;
