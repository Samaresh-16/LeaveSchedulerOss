import HolidaysTable from "../../components/holidays/HolidaysTable";

const HolidaysPage = ({ isAdmin: propIsAdmin }) => {
	// Try to get isAdmin from prop, or from localStorage/user roles if not provided
	let isAdmin = propIsAdmin;
	if (typeof isAdmin === "undefined") {
		try {
			const user = JSON.parse(localStorage.getItem("user"));
			isAdmin =
				Array.isArray(user?.roles) &&
				user.roles.some((r) =>
					typeof r === "string"
						? r.toUpperCase().includes("ADMIN")
						: (r?.name || r?.role || "").toUpperCase().includes("ADMIN")
				);
		} catch (e){
            console.error("Error parsing user roles from localStorage", e);
        }
	}

	return (
		<div className="max-w-3xl mx-auto p-6">
			<HolidaysTable isAdmin={isAdmin} />
		</div>
	);
};

export default HolidaysPage;
