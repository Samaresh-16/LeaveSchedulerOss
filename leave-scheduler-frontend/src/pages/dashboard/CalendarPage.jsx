import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt } from "react-icons/fa";
import { getUser } from "../../services/authService";
import "../../styles/Calendar.css";

const CalendarPage = () => {
	const [date, setDate] = useState(new Date());
	const [events, setEvents] = useState([]);

	// Fetch events for the visible month/year
	useEffect(() => {
		const user = getUser();
		const userId = user ? user.id : null;
		const month = date.getMonth() + 1; // JS months are 0-based, API expects 1-based
		const year = date.getFullYear();
		let url = `${import.meta.env.VITE_API_BASE_URL}/api/leave-applications/calendar?month=${month}&year=${year}`;
		if (userId) url += `&userId=${userId}`;
		fetch(url, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("authToken")}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				setEvents(data || []);
			})
			.catch(() => setEvents([]));
	}, [date]);

	// Helper to get all events for a date
	const isInRange = (tileDate, start, end) => {
		// Compare only the date part (ignore time)
		const t = new Date(
			tileDate.getFullYear(),
			tileDate.getMonth(),
			tileDate.getDate()
		);
		const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
		const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
		return t >= s && t <= e;
	};

	const getEventsForDate = (tileDate) => {
		const filtered = events.filter((event) => {
			const start = new Date(event.startDate);
			const end = new Date(event.endDate);
			// Check if tileDate is within the event range (inclusive, date only)
			return isInRange(tileDate, start, end);
		});
		return filtered;
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#18181b] via-[#23232a] to-[#1a2636]">
			<div className="bg-card-bg rounded-3xl shadow-2xl p-8 w-full border border-accent-blue animate-fade-in">
				<div className="flex items-center gap-3 mb-6">
					<FaCalendarAlt className="text-3xl text-accent-blue" />
					<h1 className="text-2xl font-bold text-accent-blue">Calendar</h1>
				</div>
				<div className="flex flex-col items-center mb-8">
					<img
						src="/leave.png"
						alt="Company Logo"
						className="h-14 mb-2 animate-bounce"
					/>
					<p className="text-gray-100 mb-4 text-center">
						This is your calendar page. You can view and navigate months below.
					</p>
				</div>

				<div className="flex justify-center mb-4">
					<Calendar
						onChange={setDate}
						value={date}
						onActiveStartDateChange={({ activeStartDate }) =>
							setDate(activeStartDate)
						}
						prev2Label={null}
						next2Label={null}
						className="bg-primary custom-calendar-view"
						tileClassName={({ date: tileDate, view }) => {
							if (view !== "month") return "";
							const classes = [];
							const now = new Date();
							const isToday =
								tileDate.getDate() === now.getDate() &&
								tileDate.getMonth() === now.getMonth() &&
								tileDate.getFullYear() === now.getFullYear();
							const isThisMonth = tileDate.getMonth() === date.getMonth();
							const isOtherMonth = !isThisMonth;

							const dayEvents = getEventsForDate(tileDate);

							// Prioritize leave status color if any leave exists for the day
							const leaveEvent = dayEvents.find(
								(e) =>
									e.eventType && e.eventType.trim().toLowerCase() === "leave"
							);
							if (leaveEvent && leaveEvent.status) {
								const statusClass = `calendar-leave-status-${leaveEvent.status.toLowerCase()}`;
								classes.push(statusClass);
							} else {
								const hasHoliday = dayEvents.some(
									(e) =>
										e.eventType &&
										e.eventType.trim().toLowerCase() === "holiday"
								);
								if (hasHoliday) classes.push("calendar-holiday");
							}

							if (isToday) classes.push("calendar-today");
							if (isOtherMonth) classes.push("calendar-other-month");
							if (isThisMonth && classes.length === 0 && !isToday)
								classes.push("calendar-this-month");
							return classes.join(" ");
						}}
						tileContent={({ date: tileDate, view }) => {
							if (view !== "month") return null;
							const dayEvents = getEventsForDate(tileDate);
							if (dayEvents.length > 0) {
								return (
									<div
										style={{ fontSize: "0.8em", marginTop: 2, lineHeight: 1.1 }}
									>
										{dayEvents.map((event, idx) => (
											<div
												key={idx}
												className={
													event.eventType &&
													event.eventType.trim().toLowerCase() === "holiday"
														? "calendar-holiday-label"
														: "calendar-leave-label"
												}
												style={{
													color: "#fff",
													fontWeight: 800,
													fontSize: "0.9em",
													margin: "2px 0",
													lineHeight: 1.2,
												}}
											>
												{event.title}
											</div>
										))}
									</div>
								);
							}
							return null;
						}}
					/>
				</div>
				{/* Legend below the calendar */}
				<div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-5 h-5 rounded"
							style={{ background: "#22c55e", border: "2px solid #16a34a" }}
						></span>
						<span>Holiday</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-5 h-5 rounded"
							style={{ background: "#ffd014", border: "2px solid #eab308" }}
						></span>
						<span>Pending Leave</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-5 h-5 rounded"
							style={{ background: "#004526", border: "2px solid #1B4D3E" }}
						></span>
						<span>Approved Leave</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-5 h-5 rounded"
							style={{ background: "#ef4444", border: "2px solid #b91c1c" }}
						></span>
						<span>Rejected Leave</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="inline-block w-5 h-5 rounded"
							style={{ background: "#6366f1", border: "2px solid #4f46e5" }}
						></span>
						<span>Withdrawn Leave</span>
					</div>
				</div>
				<div className="text-center text-xs text-gray-500 mt-8">
					&copy; {new Date().getFullYear()} Leave Scheduler. All rights
					reserved.
				</div>
			</div>
		</div>
	);
};

export default CalendarPage;
