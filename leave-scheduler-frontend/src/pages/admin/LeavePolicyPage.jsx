import axios from "axios";
import { useState } from "react";
import LeavePolicyForm from "../../components/admin/LeavePolicyForm";
import LeavePolicyList from "../../components/admin/LeavePolicyList";

const LeavePolicyPage = () => {
	const [editingPolicy, setEditingPolicy] = useState(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [deleteError, setDeleteError] = useState("");
	const [deleteSuccess, setDeleteSuccess] = useState("");

	const handleEdit = (policy) => setEditingPolicy(policy);
	const handleSuccess = () => {
		setEditingPolicy(null);
		setRefreshKey((k) => k + 1);
		setDeleteSuccess("");
		setDeleteError("");
	};
	const handleCancel = () => setEditingPolicy(null);

	const handleDelete = async (policy) => {
		if (
			!window.confirm(
				`Are you sure you want to delete policy: ${policy.leaveType}?`
			)
		)
			return;
		setDeleteError("");
		setDeleteSuccess("");
		try {
			const token = localStorage.getItem("authToken");
			await axios.delete(
				`${import.meta.env.VITE_API_BASE_URL}/api/admin/leave-policies/${
					policy.id
				}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setDeleteSuccess("Policy deleted successfully.");
			setRefreshKey((k) => k + 1);
		} catch (err) {
			setDeleteError(err.response?.data?.message || "Failed to delete policy.");
		}
	};

	return (
		<div className="max-w-5xl mx-auto py-8">
			{editingPolicy ? (
				<LeavePolicyForm
					policy={editingPolicy}
					onSuccess={handleSuccess}
					onCancel={handleCancel}
				/>
			) : (
				<LeavePolicyForm onSuccess={handleSuccess} />
			)}
			{deleteError && <p className="text-red-600 mb-2">{deleteError}</p>}
			{deleteSuccess && <p className="text-green-600 mb-2">{deleteSuccess}</p>}
			<LeavePolicyList
				key={refreshKey}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
};

export default LeavePolicyPage;
