import { useEffect, useRef } from "react";
import { FaBell, FaCheck } from "react-icons/fa";

const NotificationOverlay = ({
	anchorRef,
	unreadNotifications = [],
	readNotifications = [],
	onMarkRead,
	onMarkAllRead,
	onClose,
	loading,
}) => {
	const overlayRef = useRef(null);

	// Close overlay on outside click
	useEffect(() => {
		function handleClick(e) {
			if (
				overlayRef.current &&
				!overlayRef.current.contains(e.target) &&
				(!anchorRef ||
					!anchorRef.current ||
					!anchorRef.current.contains(e.target))
			) {
				onClose();
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [onClose, anchorRef]);

	return (
		<div
			ref={overlayRef}
			className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fade-in"
			style={{ top: 48, width: 440, minWidth: 340, maxWidth: 520 }}
		>
			<div className="p-4 border-b flex items-center gap-2">
				<FaBell className="text-accent-blue text-lg" />
				<span className="font-bold text-accent-blue text-lg">
					Notifications
				</span>
				<button
					className="ml-auto text-xs text-gray-500 hover:text-accent-pink px-2 py-1 rounded"
					onClick={onClose}
					aria-label="Close notifications"
				>
					&times;
				</button>
			</div>
			<div className="max-h-96 overflow-y-auto divide-y bg-accent-blue divide-gray-100">
				<div className="p-3">
					<div className="font-bold text-accent-red mb-2 text-sm">Unread</div>
					{loading ? (
						<div className="text-center text-gray-400 py-4">Loading...</div>
					) : unreadNotifications.length === 0 ? (
						<div className="text-center text-accent-primary py-2">
							No new notifications
						</div>
					) : (
						unreadNotifications.map((n) => (
							<div key={n.id} className="flex items-start gap-2 py-2 group">
								<div className="flex-1">
									<div className="font-medium text-primary text-sm">
										{n.title}
									</div>
									<div className="text-xs text-gray-500">{n.message}</div>
									<div className="text-xs text-gray-400 mt-1">
										{new Date(n.createdAt).toLocaleString()}
									</div>
								</div>
								<button
									className="ml-2 text-green-600 hover:bg-green-100 rounded-full p-1 transition"
									title="Mark as read"
									onClick={() => onMarkRead(n.id)}
								>
									<FaCheck />
								</button>
							</div>
						))
					)}
				</div>
				<div className="p-3 bg-accent-green">
					<div className="font-bold text-gray-500 mb-2 text-sm">
						Read
					</div>
					{loading ? (
						<div className="text-center text-gray-100 py-4">Loading...</div>
					) : readNotifications.length === 0 ? (
						<div className="text-center text-gray-100 py-2 divide-y divide-x">
							No notifications
						</div>
					) : (
						readNotifications.map((n) => (
							<div
								key={n.id}
								className="flex items-start gap-2 py-2 group opacity-90 hover:opacity-100 transition"
							>
								<div className="flex-1">
									<div className="font-medium text-primary text-sm">
										{n.title}
									</div>
									<div className="text-xs text-gray-500">{n.message}</div>
									<div className="text-xs text-gray-400 mt-1">
										{new Date(n.createdAt).toLocaleString()}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
			<div className="flex justify-center items-center p-3 border-t">
				<button
					className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded shadow hover:bg-accent-green transition font-semibold disabled:opacity-60"
					onClick={onMarkAllRead}
					disabled={loading || unreadNotifications.length === 0}
				>
					<FaCheck />
					Mark all as read
				</button>
			</div>
		</div>
	);
};

export default NotificationOverlay;
