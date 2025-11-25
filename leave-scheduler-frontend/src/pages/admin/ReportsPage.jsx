import axios from "axios";
import { useState } from "react";
import { FaFileAlt, FaFileExcel, FaFilePdf } from "react-icons/fa";

const ReportsPage = () => {
	const [tableType, setTableType] = useState(null);
	const [tableData, setTableData] = useState([]);
	const [tableLoading, setTableLoading] = useState(false);

	const handleDownload = async (type) => {
		let url = "";
		let filename = "report";
		let contentType = "application/octet-stream";
		if (type === "leave-excel") {
			url = `${
				import.meta.env.VITE_API_BASE_URL
			}/api/reports/leave-usage/export/excel`;
			filename = "leave-usage.xlsx";
		} else if (type === "leave-pdf") {
			url = `${
				import.meta.env.VITE_API_BASE_URL
			}/api/reports/leave-usage/export/pdf`;
			filename = "leave-usage.pdf";
			contentType = "application/pdf";
		}
		try {
			const token = localStorage.getItem("authToken");
			const response = await axios.get(url, {
				responseType: "blob",
				headers: { Authorization: `Bearer ${token}` },
			});
			const blob = new Blob([response.data], { type: contentType });
			const link = document.createElement("a");
			link.href = window.URL.createObjectURL(blob);
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch {
			alert("Failed to download report");
		}
	};

	const handleShowTable = async (type) => {
		if (tableType === type) {
			setTableType(null);
			setTableData([]);
			return;
		}
		setTableType(type);
		setTableLoading(true);
		let url = "";
		if (type === "leave-usage")
			url = `${import.meta.env.VITE_API_BASE_URL}/api/reports/leave-usage`;
		else if (type === "pending-approvals")
			url = `${
				import.meta.env.VITE_API_BASE_URL
			}/api/reports/pending-approvals`;
		else if (type === "holiday-schedule")
			url = `${import.meta.env.VITE_API_BASE_URL}/api/reports/holiday-schedule`;
		try {
			const token = localStorage.getItem("authToken");
			const response = await axios.get(url, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = response.data;
			if (Array.isArray(data)) {
				setTableData(data);
			} else if (
				data &&
				typeof data === "object" &&
				Array.isArray(data.content)
			) {
				// Handle Spring Data paged response
				setTableData(data.content);
			} else {
				setTableData([]);
			}
		} catch {
			setTableData([]);
			alert("Failed to fetch data");
		} finally {
			setTableLoading(false);
		}
	};

	const renderTable = () => {
		if (!tableType || tableData.length === 0) return null;
		if (tableType === "leave-usage" || tableType === "pending-approvals") {
			return (
				<div className="mt-6 overflow-x-auto rounded shadow border bg-white">
					<table className="min-w-full text-sm">
						<thead className="bg-accent-blue text-white">
							<tr>
								<th className="px-4 py-2 border">Employee</th>
								<th className="px-4 py-2 border">Leave Type</th>
								<th className="px-4 py-2 border">Start Date</th>
								<th className="px-4 py-2 border">End Date</th>
								<th className="px-4 py-2 border">Status</th>
							</tr>
						</thead>
						<tbody>
							{tableData.map((leave, i) => (
								<tr key={leave.id || i}>
									<td className="px-4 py-2 border">
										{leave.user?.fullName || leave.user?.username || "-"}
									</td>
									<td className="px-4 py-2 border">{leave.leaveType}</td>
									<td className="px-4 py-2 border">{leave.startDate}</td>
									<td className="px-4 py-2 border">{leave.endDate}</td>
									<td className="px-4 py-2 border">{leave.status}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
		if (tableType === "holiday-schedule") {
			return (
				<div className="mt-6 overflow-x-auto rounded shadow border bg-white">
					<table className="min-w-full text-sm">
						<thead className="bg-accent-blue text-white">
							<tr>
								<th className="px-4 py-2 border">Name</th>
								<th className="px-4 py-2 border">Date</th>
								<th className="px-4 py-2 border">Type</th>
								<th className="px-4 py-2 border">Description</th>
							</tr>
						</thead>
						<tbody>
							{tableData.map((h, i) => (
								<tr key={h.id || i}>
									<td className="px-4 py-2 border">{h.name}</td>
									<td className="px-4 py-2 border">{h.date}</td>
									<td className="px-4 py-2 border">{h.type}</td>
									<td className="px-4 py-2 border">{h.description}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="max-w-3xl mx-auto py-8">
			<h2 className="text-2xl font-semibold mb-4">Reports</h2>
			<p className="mb-4">
				Download and view various reports related to leaves, users, and
				policies. Choose a format below:
			</p>
			<div className="space-y-4">
				<button
					onClick={() => handleDownload("leave-excel")}
					className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 font-semibold shadow"
				>
					<FaFileExcel />
					Download Leave Usage (Excel)
				</button>
				<button
					onClick={() => handleDownload("leave-pdf")}
					className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 font-semibold shadow"
				>
					<FaFilePdf />
					Download Leave Usage (PDF)
				</button>
				<button
					onClick={() => handleShowTable("leave-usage")}
					className={`flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-md font-semibold shadow hover:bg-blue-800 transition ${
						tableType === "leave-usage" ? "ring-2 ring-accent-blue" : ""
					}`}
				>
					<FaFileAlt />
					{tableType === "leave-usage" ? "Hide" : "View"} Leave Usage (Table)
				</button>
				<button
					onClick={() => handleShowTable("pending-approvals")}
					className={`flex items-center gap-2 px-4 py-2 bg-yellow-700 text-white rounded-md font-semibold shadow hover:bg-yellow-800 transition ${
						tableType === "pending-approvals" ? "ring-2 ring-accent-yellow" : ""
					}`}
				>
					<FaFileAlt />
					{tableType === "pending-approvals" ? "Hide" : "View"} Pending
					Approvals (Table)
				</button>
				<button
					onClick={() => handleShowTable("holiday-schedule")}
					className={`flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-md font-semibold shadow hover:bg-purple-800 transition ${
						tableType === "holiday-schedule" ? "ring-2 ring-accent-purple" : ""
					}`}
				>
					<FaFileAlt />
					{tableType === "holiday-schedule" ? "Hide" : "View"} Holiday Schedule
					(Table)
				</button>
			</div>
			{tableLoading && (
				<div className="mt-4 text-center text-accent-blue">Loading...</div>
			)}
			{!tableLoading && tableType && tableData.length === 0 && (
				<div className="mt-4 text-center text-gray-500">No data found.</div>
			)}
			{renderTable()}
		</div>
	);
};

export default ReportsPage;
