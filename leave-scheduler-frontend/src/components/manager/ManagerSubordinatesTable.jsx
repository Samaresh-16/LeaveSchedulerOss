const ManagerSubordinatesTable = ({ subordinates }) => {
	if (!subordinates || subordinates.length === 0) {
		return <p className="p-4 text-gray-500">No subordinates found.</p>;
	}
	return (
		<div className="overflow-x-auto rounded-lg shadow border bg-white mt-4">
			<table className="min-w-full text-sm">
				<thead className="bg-accent-green">
					<tr>
						<th className="px-4 py-2 border text-white">Username</th>
						<th className="px-4 py-2 border text-white">Full Name</th>
						<th className="px-4 py-2 border text-white">Email</th>
						<th className="px-4 py-2 border text-white">Phone</th>
					</tr>
				</thead>
				<tbody>
					{subordinates.map((user) => (
						<tr
							key={user.id}
							className="text-center transition hover:bg-gray-700"
						>
							<td className="px-4 py-2 border">{user.username}</td>
							<td className="px-4 py-2 border">{user.fullName}</td>
							<td className="px-4 py-2 border">{user.email}</td>
							<td className="px-4 py-2 border">{user.phone}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ManagerSubordinatesTable;
