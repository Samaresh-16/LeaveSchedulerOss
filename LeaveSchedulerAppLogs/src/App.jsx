// filepath: src/App.js
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import LogDetail from './components/LogDetail';
import LogViewer from './components/LogViewer';
import MainDashboard from './components/MainDashboard';
import Navigation from './components/Navigation';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import SecurityAudit from './components/SecurityAudit';
import StatisticsView from './components/StatisticsView';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
                <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/logs" element={<LogViewer />} />
            <Route path="/logs/:id" element={<LogDetail />} />
            <Route path="/statistics" element={<StatisticsView />} />
            <Route path="/performance" element={<PerformanceAnalytics />} />
            <Route path="/security" element={<SecurityAudit />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;