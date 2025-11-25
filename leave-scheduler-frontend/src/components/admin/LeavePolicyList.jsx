import axios from "axios";
import { useEffect, useState } from "react";

const LeavePolicyList = ({ onEdit, onDelete }) => {
	const [policies, setPolicies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchPolicies = async () => {
			setLoading(true);
			setError("");
			try {
				const token = localStorage.getItem("authToken");
				const res = await axios.get(
					`${import.meta.env.VITE_API_BASE_URL}/api/admin/leave-policies`,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setPolicies(res.data);
			} catch (err) {
				setError(err.response?.data?.message || "Failed to fetch policies.");
			} finally {
				setLoading(false);
			}
		};
		fetchPolicies();
	}, []);

	return (
		<div className="mb-8">
			<h2 className="text-xl font-semibold mb-4">Existing Leave Policies</h2>
			{loading ? (
				<p>Loading...</p>
			) : error ? (
				<p className="text-red-600">{error}</p>
			) : (
				<div className="overflow-x-auto rounded-lg shadow border bg-white">
					<table className="min-w-full text-sm">
						<thead className="bg-gray-900">
							<tr>
								<th className="px-4 py-2 border">Type</th>
								<th className="px-4 py-2 border">Description</th>
								<th className="px-4 py-2 border">Annual Credit</th>
								<th className="px-4 py-2 border">Max Accumulation</th>
								<th className="px-4 py-2 border">Carry Forward</th>
								<th className="px-4 py-2 border">Active</th>
								<th className="px-4 py-2 border">Actions</th>
							</tr>
						</thead>
						<tbody>
							{policies.map((policy) => (
								<tr
									key={policy.id}
									className="text-center hover:bg-gray-500 transition"
								>
									<td className="px-4 py-2 border">{policy.leaveType}</td>
									<td className="px-4 py-2 border">{policy.description}</td>
									<td className="px-4 py-2 border">{policy.annualCredit}</td>
									<td className="px-4 py-2 border">{policy.maxAccumulation}</td>
									<td className="px-4 py-2 border">
										{policy.isCarryForward ? "Yes" : "No"}
									</td>
									<td className="px-4 py-2 border">
										{policy.isActive ? "Yes" : "No"}
									</td>
									<td className="px-4 py-2 border">
										<button
											onClick={() => onEdit(policy)}
											className="px-2 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 mr-2"
										>
											Update
										</button>
										<button
											onClick={() => onDelete(policy)}
											className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default LeavePolicyList;
