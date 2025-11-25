const UserTable = ({ users }) => {
	if (!users || users.length === 0) {
		return <p className="p-4 text-gray-500">No users found.</p>;
	}
	return (
		<div className="overflow-x-auto rounded-lg shadow border bg-white">
			<table className="min-w-full bg-card-bg rounded-xl shadow-lg border border-gray-700/40">
				<thead>
					<tr className="bg-accent-blue divide-x divide-y">
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
							Roles
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Department
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Manager
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Joining Date
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Phone
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Emergency Contact
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Active
						</th>
						<th className="px-6 py-3 text-left text-xs font-extrabold text-white uppercase tracking-wider border-b border-gray-400">
							Last Login
						</th>
					</tr>
				</thead>
				<tbody className="bg-card-bg divide-y divide-gray-700 text-primary">
					{users.map((user) => (
						<tr
							key={user.id}
							className="text-center transition hover:bg-gray-500"
						>
							<td className="px-4 py-2 border">{user.id}</td>
							<td className="px-4 py-2 border">{user.username}</td>
							<td className="px-4 py-2 border">{user.fullName}</td>
							<td className="px-4 py-2 border">{user.email}</td>
							<td className="px-4 py-2 border">{user.roles?.join(", ")}</td>
							<td className="px-4 py-2 border">{user.department}</td>
							<td className="px-4 py-2 border">{user.managerName || "-"}</td>
							<td className="px-4 py-2 border">{user.joiningDate}</td>
							<td className="px-4 py-2 border">{user.phone}</td>
							<td className="px-4 py-2 border">{user.emergencyContact}</td>
							<td className="px-4 py-2 border">{user.active ? "Yes" : "No"}</td>
							<td className="px-4 py-2 border">
								{user.lastLogin?.replace("T", " ")}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default UserTable;
