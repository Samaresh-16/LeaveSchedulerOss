import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./styles/App.css";

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<div>Welcome to Leave Scheduler</div>} />
			</Routes>
		</Router>
	);
}

export default App;
