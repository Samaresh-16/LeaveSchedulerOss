import { FaGauge } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ApprovedLeaves from "../../components/dashboard/ApprovedLeaves";
import LeaveBalances from "../../components/dashboard/LeaveBalances";
import LeaveHistory from "../../components/dashboard/LeaveHistory";
import PendingRequests from "../../components/dashboard/PendingRequests";

const CommonDashboard = () => {
	const navigate = useNavigate();
	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fade-in text-center">
				<h1 className="w-full text-4xl font-extrabold  text-primary flex items-center justify-center gap- animate-fade-in">
					<FaGauge className="text-accent-yellow text-5xl drop-shadow mr-4" />
					My Dashboard
				</h1>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<LeaveBalances />
				<PendingRequests />
				<ApprovedLeaves />
			</div>
			<div className="mb-8">
				<LeaveHistory />
			</div>
			<div className="mb-8 text-center">
				<h3 className="text-2xl font-semibold mb-3">Apply for Leave</h3>
				<button
					onClick={() => navigate("/leaves/apply")}
					className="bg-blue text-black px-4 py-2 rounded-md shadow-lg hover:bg-accent-blue/80 transition duration-200"
				>
					Apply for Leave
				</button>
			</div>
		</div>
	);
};

export default CommonDashboard;
