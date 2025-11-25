import { FaBell } from "react-icons/fa";

/**
 * NotificationButton component
 * @param {Object} props
 * @param {number} props.unreadCount - Number of unread notifications
 * @param {function} props.onClick - Handler for button click
 */
const NotificationButton = ({ unreadCount = 0, onClick }) => {
	return (
		<button
			onClick={onClick}
			className="animate-bounce flex items-center relative flex items-center justify-center px-3 py-2 bg-card-bg text-accent-blue rounded-full shadow hover:bg-accent-blue/10 transition-all focus:outline-none"
			title="Notifications"
		>
			<FaBell className="text-2xl text-primary" />
			{unreadCount > 0 && (
				<span className="absolute -top-1 -right-1 bg-accent-pink text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center animate-pulse pointer-events-none select-none">
					{unreadCount > 99 ? "99+" : unreadCount}
				</span>
			)}
		</button>
	);
};

export default NotificationButton;
