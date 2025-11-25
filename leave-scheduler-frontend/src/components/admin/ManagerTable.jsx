const ManagerTable = ({ managers }) => {
	if (!managers || managers.length === 0) {
		return <p className="p-4 text-gray-500">No managers found.</p>;
	}
	return (
		<div className="overflow-x-auto rounded-lg shadow border bg-white">
			<table className="min-w-full text-primarybg-card-bg rounded-xl shadow-lg border border-gray-700/40">
				<thead className="bg-accent-blue">
					<tr className="divide-x divide-y">
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							ID
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Username
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Full Name
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Email
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Department
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Subordinates
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Phone
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Active
						</th>
					</tr>
				</thead>
				<tbody className="bg-card-bg divide-y divide-gray-700 text-primary">
					{managers.map((manager) => (
						<tr
							key={manager.id}
							className="text-center transition hover:bg-gray-500"
						>
							<td className="px-4 py-2 border">{manager.id}</td>
							<td className="px-4 py-2 border">{manager.username}</td>
							<td className="px-4 py-2 border">{manager.fullName}</td>
							<td className="px-4 py-2 border">{manager.email}</td>
							<td className="px-4 py-2 border">{manager.department}</td>
							<td className="px-4 py-2 border text-left bg-white ">
								<ul className="list-disc list-inside">
									{manager.subordinates && manager.subordinates.length > 0 ? (
										manager.subordinates.map((sub) => (
											<li key={sub.id}>
												{sub.fullName} ({sub.username})
											</li>
										))
									) : (
										<li className="text-gray-400">None</li>
									)}
								</ul>
							</td>
							<td className="px-4 py-2 border">{manager.phone}</td>
							<td className="px-4 py-2 border">
								{manager.active ? "Yes" : "No"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ManagerTable;
