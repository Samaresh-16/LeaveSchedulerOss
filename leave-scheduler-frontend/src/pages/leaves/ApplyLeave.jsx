import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const ApplyLeave = () => {
	const [form, setForm] = useState({
		startDate: "",
		endDate: "",
		leaveType: "",
		reason: "",
		contactAddress: "",
		contactPhone: "",
		attachmentPath: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const token = localStorage.getItem("authToken");
			await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}/api/leave-applications`,
				form,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setSuccess("Leave application submitted successfully.");
			setLoading(false);
			setTimeout(() => navigate("/leave-applications"), 1200);
		} catch (err) {
			setError(
				err.response?.data?.message || "Failed to submit leave application."
			);
			setLoading(false);
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow border max-w-xl mx-auto mt-8 mb-8">
			<h2 className="text-xl font-semibold mb-4">Apply for Leave</h2>
			{error && <p className="text-red-600 mb-2">{error}</p>}
			{success && <p className="text-green-600 mb-2">{success}</p>}
			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block mb-1 font-medium">Leave Type</label>
					<select
						name="leaveType"
						value={form.leaveType}
						onChange={handleChange}
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
				<div>
					<label className="block mb-1 font-medium">Start Date</label>
					<input
						type="date"
						name="startDate"
						value={form.startDate}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
						required
					/>
				</div>
				<div>
					<label className="block mb-1 font-medium">End Date</label>
					<input
						type="date"
						name="endDate"
						value={form.endDate}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
						required
					/>
				</div>
				<div>
					<label className="block mb-1 font-medium">Reason</label>
					<textarea
						name="reason"
						value={form.reason}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
						required
					/>
				</div>
				<div>
					<label className="block mb-1 font-medium">Contact Address</label>
					<input
						type="text"
						name="contactAddress"
						value={form.contactAddress}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
						maxLength={255}
					/>
				</div>
				<div>
					<label className="block mb-1 font-medium">Contact Phone</label>
					<input
						type="text"
						name="contactPhone"
						value={form.contactPhone}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
						maxLength={20}
					/>
				</div>
				{/* Attachment path (optional, can be enhanced to file upload) */}
				<div>
					<label className="block mb-1 font-medium">
						Attachment Path (optional)
					</label>
					<input
						type="text"
						name="attachmentPath"
						value={form.attachmentPath}
						onChange={handleChange}
						className="border rounded px-3 py-2 w-full"
					/>
				</div>
				<button
					type="submit"
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
					disabled={loading}
				>
					{loading ? "Submitting..." : "Submit Application"}
				</button>
			</form>
		</div>
	);
};

export default ApplyLeave;
