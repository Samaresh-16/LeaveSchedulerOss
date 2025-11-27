// filepath: src/components/MainDashboard.js
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  FileText,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import StatCard from './StatCard';

const MainDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentFailures, setRecentFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboard, failures] = await Promise.all([
          apiService.getDashboardData(),
          apiService.getRecentFailures(0, 5)
        ]);
        
        setDashboardData(dashboard);
        setRecentFailures(failures.content || []);
        setLastRefreshed(new Date());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="error-message">Error: {error}</div>;

  const totalLogs = dashboardData?.totalLogs || 0;
  const success = dashboardData?.successfulOperations || 0;
  const failures = dashboardData?.failedOperations || 0;
  const slowOps = dashboardData?.slowOperationsCount || 0;
  const successRate = totalLogs ? ((success / totalLogs) * 100).toFixed(1) : 0;
  const failureRate = totalLogs ? ((failures / totalLogs) * 100).toFixed(1) : 0;

  const stats = [
    {
      title: 'Total Logs',
      value: totalLogs.toLocaleString(),
      icon: Database,
      color: 'blue',
      subtitle: 'All recorded events'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: CheckCircle,
      color: 'green',
      subtitle: `${success.toLocaleString()} successful`
    },
    {
      title: 'Failure Rate',
      value: `${failureRate}%`,
      icon: XCircle,
      color: 'red',
      subtitle: `${failures.toLocaleString()} failed`
    },
    {
      title: 'Slow Operations',
      value: slowOps.toLocaleString(),
      icon: Clock,
      color: 'orange',
      subtitle: 'Over performance threshold'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-top">
          <div>
            <h1>Leave Scheduler Logs Dashboard</h1>
            <p>Monitor operations, performance & health</p>
          </div>
          <div className="dashboard-header-actions">
            <button onClick={() => window.location.reload()} className="refresh-btn">Refresh</button>
            {lastRefreshed && (
              <div className="last-refreshed">Updated {lastRefreshed.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {loading && !dashboardData ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card skeleton">
              <div className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value skeleton-bar" />
                <div className="stat-title skeleton-bar small" />
                <div className="stat-subtitle skeleton-bar tiny" />
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Failures</h2>
            <Link to="/logs?status=FAILURE" className="view-all-link">
              View All <TrendingUp size={16} />
            </Link>
          </div>
          <div className="failures-list">
            {recentFailures.length > 0 ? (
              recentFailures.map((log) => (
                <div key={log.id} className="failure-item">
                  <div className="failure-icon">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="failure-content">
                    <div className="failure-operation">{log.operation}</div>
                    <div className="failure-message">{log.message}</div>
                    <div className="failure-meta">
                      <span>{log.username} • {new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-failures">
                <CheckCircle className="no-failures-icon" />
                <span>No recent failures</span>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <Link to="/logs" className="action-card">
              <FileText className="action-icon" />
              <div className="action-content">
                <div className="action-title">View All Logs</div>
                <div className="action-description">Browse and filter application logs</div>
              </div>
            </Link>
            
            <Link to="/logs?operation=CRITICAL" className="action-card">
              <AlertTriangle className="action-icon" />
              <div className="action-content">
                <div className="action-title">Critical Operations</div>
                <div className="action-description">Monitor admin and delete operations</div>
              </div>
            </Link>
            
            <Link to="/statistics" className="action-card">
              <Activity className="action-icon" />
              <div className="action-content">
                <div className="action-title">Statistics & Analytics</div>
                <div className="action-description">View detailed statistics and trends</div>
              </div>
            </Link>

            <Link to="/performance" className="action-card">
              <Clock className="action-icon" />
              <div className="action-content">
                <div className="action-title">Performance Monitoring</div>
                <div className="action-description">Monitor response times and throughput</div>
              </div>
            </Link>

            <Link to="/security" className="action-card">
              <AlertTriangle className="action-icon" />
              <div className="action-content">
                <div className="action-title">Security Audit</div>
                <div className="action-description">Review authentication and security events</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="health-indicators">
        {dashboardData?.hasRecentFailures && (
          <div className="alert-banner">
            <AlertTriangle size={20} />
            <span>Recent failures detected. Investigate issues.</span>
            <Link to="/logs?status=FAILURE" className="alert-link">Details</Link>
          </div>
        )}
        {slowOps > 0 && !loading && (
          <div className="alert-banner slow-ops">
            <Clock size={20} />
            <span>{slowOps} slow operations impacting performance.</span>
            <Link to="/performance" className="alert-link">Analyze</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDashboard;