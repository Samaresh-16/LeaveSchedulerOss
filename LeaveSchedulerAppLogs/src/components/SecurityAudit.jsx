import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  GlobeAltIcon,
  KeyIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { format, subDays } from 'date-fns';
import { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import apiService from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const SecurityAudit = () => {
  const [authLogs, setAuthLogs] = useState([]);
  const [criticalOps, setCriticalOps] = useState([]);
  const [securityMetrics, setSecurityMetrics] = useState({});
  const [ipActivityData, setIpActivityData] = useState([]);
  const [failedAttemptsData, setFailedAttemptsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  useEffect(() => {
    fetchSecurityData();
  }, [selectedPeriod]);

  // Helper function to process logs and extract security metrics
  const calculateSecurityMetrics = (authLogs, criticalOps, allLogs) => {
    const uniqueUsers = new Set(authLogs.map(log => log.username || log.userId).filter(Boolean));
    const uniqueIPs = new Set(authLogs.map(log => log.ipAddress).filter(Boolean));
    
    const loginLogs = authLogs.filter(log => 
      log.operation?.includes('LOGIN') || log.operation?.includes('LOGOUT')
    );
    
    const failedAuth = loginLogs.filter(log => log.status === 'FAILURE');
    
    // Identify suspicious IPs (those with high failure rates)
    const ipFailures = {};
    authLogs.forEach(log => {
      if (log.ipAddress) {
        if (!ipFailures[log.ipAddress]) {
          ipFailures[log.ipAddress] = { total: 0, failed: 0 };
        }
        ipFailures[log.ipAddress].total++;
        if (log.status === 'FAILURE') {
          ipFailures[log.ipAddress].failed++;
        }
      }
    });
    
    const suspiciousIPs = Object.entries(ipFailures).filter(
      ([ip, stats]) => stats.failed / stats.total > 0.3 && stats.failed > 2
    ).length;
    
    const adminOps = criticalOps.filter(op => 
      op.operation?.includes('ADMIN') || op.operation?.includes('DELETE') || op.operation?.includes('UPDATE')
    );
    
    return {
      totalAuthAttempts: loginLogs.length,
      failedAuthAttempts: failedAuth.length,
      suspiciousIPs: suspiciousIPs,
      criticalOperationsCount: criticalOps.length,
      uniqueUsers: uniqueUsers.size,
      adminOperations: adminOps.length,
      dataAccessAttempts: allLogs.filter(log => log.operation?.includes('VIEW') || log.operation?.includes('GET')).length,
      securityAlerts: failedAuth.length + suspiciousIPs
    };
  };

  // Helper function to calculate IP activity from logs
  const calculateIpActivity = (logs) => {
    const ipStats = {};
    
    logs.forEach(log => {
      if (log.ipAddress) {
        if (!ipStats[log.ipAddress]) {
          ipStats[log.ipAddress] = {
            ip: log.ipAddress,
            requests: 0,
            failures: 0,
            successRate: 0,
            riskScore: 0
          };
        }
        
        ipStats[log.ipAddress].requests++;
        if (log.status === 'FAILURE') {
          ipStats[log.ipAddress].failures++;
        }
      }
    });
    
    // Calculate success rates and risk scores
    return Object.values(ipStats).map(stat => {
      const successRate = ((stat.requests - stat.failures) / stat.requests * 100).toFixed(1);
      const failureRate = (stat.failures / stat.requests * 100);
      const riskScore = Math.min(100, Math.floor(
        failureRate * 2 + // Failure rate contributes heavily
        (stat.failures > 5 ? 30 : 0) + // Multiple failures increase risk
        (stat.requests > 20 ? 20 : 0) // High volume is suspicious
      ));
      
      return {
        ...stat,
        successRate,
        riskScore
      };
    }).sort((a, b) => b.requests - a.requests);
  };

  // Helper function to calculate security trends over time
  const calculateSecurityTrends = (logs, period) => {
    const now = new Date();
    const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;
    const timeGroups = {};
    
    // Initialize time buckets
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const key = format(date, period === '24h' ? 'HH:00' : 'MMM dd');
      timeGroups[key] = {
        date: key,
        failedLogins: 0,
        suspiciousActivity: 0,
        blockedIPs: 0,
        criticalOps: 0
      };
    }
    
    // Process logs
    logs.forEach(log => {
      const utcTime = log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z';
      const logDate = new Date(utcTime);
      const key = format(logDate, period === '24h' ? 'HH:00' : 'MMM dd', { timeZone: 'Asia/Kolkata' });
      
      if (timeGroups[key]) {
        // Count failed logins
        if (log.operation?.includes('LOGIN') && log.status === 'FAILURE') {
          timeGroups[key].failedLogins++;
        }
        
        // Count suspicious activity (failures, errors)
        if (log.status === 'FAILURE' || log.message?.toLowerCase().includes('error')) {
          timeGroups[key].suspiciousActivity++;
        }
        
        // Count critical operations
        if (log.operation?.includes('DELETE') || log.operation?.includes('ADMIN') || 
            log.operation?.includes('UPDATE')) {
          timeGroups[key].criticalOps++;
        }
      }
    });
    
    return Object.values(timeGroups);
  };

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [authenticationLogs, criticalOperations, allLogs] = await Promise.all([
        apiService.getAuthenticationLogs(0, 50),
        apiService.getCriticalOperations(0, 20),
        apiService.getLogs({ page: 0, size: 1000, sortBy: 'timestamp', sortDir: 'desc' })
      ]);
      
      const authContent = authenticationLogs.content || [];
      const criticalContent = criticalOperations.content || [];
      const allContent = allLogs.content || [];
      
      setAuthLogs(authContent);
      setCriticalOps(criticalContent);
      
      // Calculate real metrics from actual data
      const metrics = calculateSecurityMetrics(authContent, criticalContent, allContent);
      setSecurityMetrics(metrics);
      
      // Calculate IP activity from logs
      const ipActivity = calculateIpActivity(allContent);
      setIpActivityData(ipActivity);
      
      // Calculate security trends
      const trends = calculateSecurityTrends(allContent, selectedPeriod);
      setFailedAttemptsData(trends);
      
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };





  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSecurityData();
    setRefreshing(false);
    toast.success('Security data refreshed');
  };

  // Chart configurations
  const authStatusPieData = {
    labels: ['Successful', 'Failed', 'Blocked', 'Suspicious'],
    datasets: [
      {
        data: [
          securityMetrics.totalAuthAttempts - securityMetrics.failedAuthAttempts,
          securityMetrics.failedAuthAttempts,
          Math.floor(securityMetrics.failedAuthAttempts * 0.3),
          Math.floor(securityMetrics.failedAuthAttempts * 0.2)
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6'],
        borderColor: ['#059669', '#DC2626', '#D97706', '#7C3AED'],
        borderWidth: 2,
      },
    ],
  };

  const ipActivityChartData = {
    labels: ipActivityData.slice(0, 8).map(item => item.ip),
    datasets: [
      {
        label: 'Total Requests',
        data: ipActivityData.slice(0, 8).map(item => item.requests),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
      },
      {
        label: 'Failed Requests',
        data: ipActivityData.slice(0, 8).map(item => item.failures),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
      },
    ],
  };

  const securityTrendsData = {
    labels: failedAttemptsData.map(item => item.date),
    datasets: [
      {
        label: 'Failed Logins',
        data: failedAttemptsData.map(item => item.failedLogins),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Suspicious Activity',
        data: failedAttemptsData.map(item => item.suspiciousActivity),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Critical Operations',
        data: failedAttemptsData.map(item => item.criticalOps),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const riskScoreChartData = {
    labels: ipActivityData.slice(0, 6).map(item => item.ip),
    datasets: [
      {
        label: 'Risk Score',
        data: ipActivityData.slice(0, 6).map(item => item.riskScore),
        backgroundColor: ipActivityData.slice(0, 6).map(item => 
          item.riskScore > 70 ? '#DC2626' : 
          item.riskScore > 40 ? '#F59E0B' : '#10B981'
        ),
        borderColor: ipActivityData.slice(0, 6).map(item => 
          item.riskScore > 70 ? '#B91C1C' : 
          item.riskScore > 40 ? '#D97706' : '#059669'
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Audit & Monitoring</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor authentication, access patterns, and security incidents
          </p>
        </div>
        <div className="flex space-x-4">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Security Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
              <KeyIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Auth Attempts</p>
              <p className="text-lg font-semibold text-gray-900">
                {securityMetrics.totalAuthAttempts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
              <ShieldExclamationIcon className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Failed Auth</p>
              <p className="text-lg font-semibold text-gray-900">
                {securityMetrics.failedAuthAttempts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
              <GlobeAltIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Suspicious IPs</p>
              <p className="text-lg font-semibold text-gray-900">
                {securityMetrics.suspiciousIPs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Critical Ops</p>
              <p className="text-lg font-semibold text-gray-900">
                {securityMetrics.criticalOperationsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Unique Users</p>
              <p className="text-lg font-semibold text-gray-900">
                {securityMetrics.uniqueUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg">
              <LockClosedIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Admin Ops</p>
              <p className="text-lg font-semibold text-gray-900">
                {securityMetrics.adminOperations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-teal-100 rounded-lg">
              <EyeIcon className="h-5 w-5 text-teal-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Data Access</p>
              <p className="text-lg font-semibold text-gray-900">
                {securityMetrics.dataAccessAttempts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Sec Alerts</p>
              <p className="text-lg font-semibold text-gray-900">
                {securityMetrics.securityAlerts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Status</h3>
          <Pie data={authStatusPieData} options={pieOptions} />
        </div>

        {/* IP Activity Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top IP Addresses Activity</h3>
          <Bar data={ipActivityChartData} options={chartOptions} />
        </div>

        {/* Security Trends */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Trends Over Time</h3>
          <Line data={securityTrendsData} options={chartOptions} />
        </div>

        {/* Risk Score Analysis */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">IP Risk Score Analysis</h3>
          <Bar data={riskScoreChartData} options={chartOptions} />
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Authentication Logs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Authentication Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {authLogs.slice(0, 5).map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.username || log.userId || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.operation || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'SUCCESS' 
                          ? 'bg-green-100 text-green-800'
                          : log.status === 'FAILURE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {log.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp ? format(new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z'), 'MMM dd, HH:mm') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* IP Activity Details */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">IP Address Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ipActivityData.slice(0, 6).map((ip, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ip.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ip.requests} ({ip.failures} failed)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ip.successRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ip.riskScore > 70 
                          ? 'bg-red-100 text-red-800'
                          : ip.riskScore > 40
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ip.riskScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Critical Operations */}
      {criticalOps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Critical Operations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {criticalOps.slice(0, 10).map((op, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {op.operation || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {op.username || op.userId || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {op.entityType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        op.status === 'SUCCESS' 
                          ? 'bg-green-100 text-green-800'
                          : op.status === 'FAILURE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {op.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {op.timestamp ? format(new Date(op.timestamp.endsWith('Z') ? op.timestamp : op.timestamp + 'Z'), 'MMM dd, HH:mm:ss') : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityAudit;