import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const HolidaysTable = ({ isAdmin }) => {
	const [holidays, setHolidays] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [editId, setEditId] = useState(null);
	const [form, setForm] = useState({
		name: "",
		date: "",
		type: "",
		description: "",
		isRecurring: false,
	});
	const [formError, setFormError] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [deleteId, setDeleteId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const fetchHolidays = async () => {
		setLoading(true);
		setError("");
		try {
			const token = localStorage.getItem("authToken");
			const res = await axios.get(
				`${import.meta.env.VITE_API_BASE_URL}/api/holidays/year/${new Date().getFullYear()}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setHolidays(res.data || []);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to load holidays.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchHolidays();
	}, []);

	// Sort holidays by date ascending before rendering
	const sortedHolidays = [...holidays].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);

	const handleEdit = (holiday) => {
		setEditId(holiday.id);
		setForm({
			name: holiday.name,
			date: holiday.date,
			type: holiday.type || "",
			description: holiday.description || "",
			isRecurring: holiday.isRecurring || false,
		});
		setShowForm(true);
		setFormError("");
	};

	const handleAdd = () => {
		setEditId(null);
		setForm({
			name: "",
			date: "",
			type: "",
			description: "",
			isRecurring: false,
		});
		setShowForm(true);
		setFormError("");
	};

	const handleDelete = async (holiday) => {
		if (!window.confirm(`Delete holiday: ${holiday.name}?`)) return;
		setDeleteId(holiday.id);
		setDeleteLoading(true);
		try {
			const token = localStorage.getItem("authToken");
			await axios.delete(
				`${import.meta.env.VITE_API_BASE_URL}/api/holidays/${holiday.id}`,
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setHolidays((prev) => prev.filter((h) => h.id !== holiday.id));
		} catch (err) {
			setError(err.response?.data?.message || "Failed to delete holiday.");
		} finally {
			setDeleteId(null);
			setDeleteLoading(false);
		}
	};

	const handleFormChange = (e) => {
		const { name, value, type: inputType, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: inputType === "checkbox" ? checked : value,
		}));
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setFormError("");
		try {
			const token = localStorage.getItem("authToken");
			if (editId) {
				// Update
				await axios.put(
					`${import.meta.env.VITE_API_BASE_URL}/api/holidays/${editId}`,
					form,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setHolidays((prev) =>
					prev.map((h) => (h.id === editId ? { ...h, ...form } : h))
				);
			} else {
				// Add
				const res = await axios.post(
					`${import.meta.env.VITE_API_BASE_URL}/api/holidays`,
					form,
					{ headers: { Authorization: `Bearer ${token}` } }
				);
				setHolidays((prev) => [...prev, res.data]);
			}
			setShowForm(false);
		} catch (err) {
			setFormError(err.response?.data?.message || "Failed to save holiday.");
		}
	};

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-2xl font-bold">Holiday List</h2>
				{isAdmin && (
					<button
						className="bg-accent-green text-white px-3 py-2 rounded shadow hover:bg-accent-blue transition flex items-center gap-2"
						onClick={handleAdd}
						title="Add Holiday"
					>
						<FaPlus />
						<span className="hidden md:inline">Add</span>
					</button>
				)}
			</div>
			<div className="flex justify-center">
				{loading ? (
					<p className="p-4">Loading...</p>
				) : error ? (
					<p className="p-4 text-red-600">{error}</p>
				) : holidays.length === 0 ? (
					<p className="p-4 text-gray-500">No holidays available.</p>
				) : (
					<table
						className="bg-white rounded-xl outline shadow justify-center text-sm"
						style={{
							width: "80vw",
							maxWidth: "1400px",
							minWidth: "900px",
							overflow: "hidden",
						}}
					>
						<thead className="bg-accent-blue">
							<tr>
								<th className="px-2 py-2 border whitespace-nowrap">Date</th>
								<th className="px-2 py-2 border whitespace-nowrap">Day</th>
								<th className="px-2 py-2 border whitespace-nowrap">Name</th>
								<th className="px-2 py-2 border whitespace-nowrap">Type</th>
								<th className="px-2 py-2 border whitespace-nowrap">
									Description
								</th>
								{isAdmin && (
									<th className="px-2 py-2 border whitespace-nowrap">
										Actions
									</th>
								)}
							</tr>
						</thead>
						<tbody>
							{sortedHolidays.map((h) => {
								const dayOfWeek = h.date
									? new Date(h.date).toLocaleDateString(undefined, {
											weekday: "long",
									  })
									: "";
								return (
									<tr
										key={h.id}
										className="text-center transition hover:bg-gray-500"
									>
										<td className="px-2 py-2 border whitespace-nowrap">
											{h.date}
										</td>
										<td className="px-2 py-2 border whitespace-nowrap">
											{dayOfWeek}
										</td>
										<td className="px-2 py-2 border whitespace-nowrap">
											{h.name}
										</td>
										<td className="px-2 py-2 border whitespace-nowrap">
											{h.type}
										</td>
										<td className="px-2 py-2 border whitespace-nowrap">
											{h.description}
										</td>
										{isAdmin && (
											<td className="p-2 border outline flex justify-center gap-3 whitespace-nowrap">
												<button
													className="bg-accent-yellow text-black px-2 py-1 rounded hover:bg-accent-blue"
													onClick={() => handleEdit(h)}
													title="Edit"
												>
													<FaEdit />
												</button>
												<button
													className="bg-accent-red text-white px-2 py-1 rounded hover:bg-accent-pink"
													onClick={() => handleDelete(h)}
													disabled={deleteLoading && deleteId === h.id}
													title="Delete"
												>
													<FaTrash />
												</button>
											</td>
										)}
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>
			{showForm && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
					<form
						onSubmit={handleFormSubmit}
						className="bg-white text-black rounded-xl shadow-lg p-6 w-full max-w-md animate-fade-in flex flex-col gap-4"
					>
						<h3 className="text-xl font-bold mb-2">
							{editId ? "Edit Holiday" : "Add Holiday"}
						</h3>
						<label className="font-semibold">
							Name
							<input
								name="name"
								value={form.name}
								onChange={handleFormChange}
								required
								maxLength={100}
								className="w-full border rounded px-3 py-2 mt-1"
							/>
						</label>
						<label className="font-semibold">
							Date
							<input
								name="date"
								type="date"
								value={form.date}
								onChange={handleFormChange}
								required
								className="w-full border rounded px-3 py-2 mt-1"
							/>
						</label>
						<label className="font-semibold">
							Type
							<input
								name="type"
								value={form.type}
								onChange={handleFormChange}
								maxLength={50}
								className="w-full border rounded px-3 py-2 mt-1"
							/>
						</label>
						<label className="font-semibold">
							Description
							<textarea
								name="description"
								value={form.description}
								onChange={handleFormChange}
								maxLength={255}
								className="w-full border rounded px-3 py-2 mt-1"
							/>
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								name="isRecurring"
								checked={form.isRecurring}
								onChange={handleFormChange}
							/>
							<span>Recurring</span>
						</label>
						{formError && <p className="text-red-600 text-sm">{formError}</p>}
						<div className="flex gap-2 justify-end mt-2">
							<button
								type="button"
								onClick={() => setShowForm(false)}
								className="px-4 py-2 rounded bg-gray-400 text-white"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-4 py-2 rounded bg-accent-blue text-white font-semibold"
							>
								{editId ? "Update" : "Add"}
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
};

export default HolidaysTable;
