import {
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  FunnelIcon
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

const StatisticsView = () => {
  const [statistics, setStatistics] = useState(null);
  const [operationStats, setOperationStats] = useState([]);
  const [userActivityStats, setUserActivityStats] = useState([]);
  const [dailyActivityData, setDailyActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [refreshing, setRefreshing] = useState(false);

  const timeRanges = [
    { value: '1day', label: 'Last 24 Hours' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' }
  ];

  useEffect(() => {
    fetchAllStatistics();
  }, [selectedTimeRange]);

  const fetchAllStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch logs to calculate statistics
      const [statsFromApi, logsResponse, dailyActivity] = await Promise.all([
        apiService.getStatistics().catch(() => null), // Try API endpoint, fallback to null
        apiService.getLogs({ page: 0, size: 1000, sortBy: 'timestamp', sortDir: 'desc' }),
        fetchDailyActivity()
      ]);
      
      const logs = logsResponse.content || [];
      
      // Calculate statistics from logs
      const totalOperations = logs.length;
      const successfulOperations = statsFromApi?.successfulOperations || logs.filter(log => log.status === 'SUCCESS').length;
      const failedOperations = statsFromApi?.failedOperations || logs.filter(log => log.status === 'FAILURE').length;
      const warningOperations = logs.filter(log => log.status === 'WARNING').length;
      const infoOperations = logs.filter(log => log.status === 'INFO').length;
      
      // Calculate operation statistics
      const operationCounts = {};
      logs.forEach(log => {
        const op = log.operation || 'UNKNOWN';
        operationCounts[op] = (operationCounts[op] || 0) + 1;
      });
      const operationStats = Object.entries(operationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      // Calculate user activity statistics
      const userCounts = {};
      logs.forEach(log => {
        const user = log.username || log.userId || 'anonymous';
        userCounts[user] = (userCounts[user] || 0) + 1;
      });
      const userActivityStats = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      // Use API data if available, otherwise use calculated data
      setStatistics({
        totalOperations: statsFromApi?.totalOperations || totalOperations,
        successfulOperations: statsFromApi?.successfulOperations || successfulOperations,
        failedOperations: statsFromApi?.failedOperations || failedOperations,
        warningOperations: statsFromApi?.warningOperations || warningOperations,
        infoOperations: statsFromApi?.infoOperations || infoOperations
      });
      
      setOperationStats(statsFromApi?.operationStatistics || operationStats);
      setUserActivityStats(statsFromApi?.userActivityStatistics || userActivityStats);
      setDailyActivityData(dailyActivity);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyActivity = async () => {
    try {
      // Fetch recent logs to calculate daily activity
      const logs = await apiService.getLogs({ 
        page: 0, 
        size: 1000, 
        sortBy: 'timestamp', 
        sortDir: 'desc' 
      });
      
      const days = getDaysForRange(selectedTimeRange);
      const dailyStats = {};
      
      // Initialize all days
      days.forEach(day => {
        const key = format(day, 'MMM dd');
        dailyStats[key] = { date: key, success: 0, failure: 0, total: 0 };
      });
      
      // Count logs by day
      (logs.content || []).forEach(log => {
        if (!log.timestamp) return;
        const utcTime = log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z';
        const logDate = new Date(utcTime);
        const key = format(logDate, 'MMM dd', { timeZone: 'Asia/Kolkata' });
        
        if (dailyStats[key]) {
          dailyStats[key].total++;
          if (log.status === 'SUCCESS') {
            dailyStats[key].success++;
          } else if (log.status === 'FAILURE') {
            dailyStats[key].failure++;
          }
        }
      });
      
      return Object.values(dailyStats);
    } catch (error) {
      console.error('Error fetching daily activity:', error);
      return [];
    }
  };

  const getDaysForRange = (range) => {
    const today = new Date();
    const days = [];
    const numDays = range === '1day' ? 1 : range === '7days' ? 7 : range === '30days' ? 30 : 90;
    
    for (let i = numDays - 1; i >= 0; i--) {
      days.push(subDays(today, i));
    }
    return days;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllStatistics();
    setRefreshing(false);
    toast.success('Statistics refreshed');
  };

  // Chart configurations
  const operationChartData = {
    labels: operationStats.slice(0, 10).map(stat => stat[0] || 'Unknown'),
    datasets: [
      {
        label: 'Operation Count',
        data: operationStats.slice(0, 10).map(stat => stat[1] || 0),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
          '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#84CC16'
        ],
        borderColor: [
          '#2563EB', '#DC2626', '#059669', '#D97706', '#7C3AED',
          '#DB2777', '#4B5563', '#0D9488', '#EA580C', '#65A30D'
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusPieData = {
    labels: ['Success', 'Failure', 'Warning', 'Info'],
    datasets: [
      {
        data: [
          statistics?.successfulOperations || 0,
          statistics?.failedOperations || 0,
          statistics?.warningOperations || 0,
          statistics?.infoOperations || 0
        ],
        backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#6B7280'],
        borderColor: ['#059669', '#DC2626', '#D97706', '#4B5563'],
        borderWidth: 2,
      },
    ],
  };

  const dailyActivityChartData = {
    labels: dailyActivityData.map(day => day.date),
    datasets: [
      {
        label: 'Successful Operations',
        data: dailyActivityData.map(day => day.success),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Failed Operations',
        data: dailyActivityData.map(day => day.failure),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Total Operations',
        data: dailyActivityData.map(day => day.total),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const userActivityChartData = {
    labels: userActivityStats.slice(0, 8).map(stat => stat[0] || 'Anonymous'),
    datasets: [
      {
        label: 'User Activity Count',
        data: userActivityStats.slice(0, 8).map(stat => stat[1] || 0),
        backgroundColor: '#8B5CF6',
        borderColor: '#7C3AED',
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
      title: {
        display: false,
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
          <h1 className="text-3xl font-bold text-gray-900">Log Statistics & Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive analysis of application logs and system performance
          </p>
        </div>
        <div className="flex space-x-4">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Operations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.totalOperations?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <ChartPieIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.successfulOperations && statistics?.totalOperations
                  ? ((statistics.successfulOperations / statistics.totalOperations) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
              <FunnelIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed Operations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics?.failedOperations?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {userActivityStats?.length || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operation Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Operations</h3>
          {operationStats.length > 0 ? (
            <Bar data={operationChartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No operation data available
            </div>
          )}
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operation Status Distribution</h3>
          <Pie data={statusPieData} options={pieOptions} />
        </div>

        {/* Daily Activity Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Trend ({selectedTimeRange})</h3>
          <Line data={dailyActivityChartData} options={chartOptions} />
        </div>

        {/* User Activity Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
          {userActivityStats.length > 0 ? (
            <Bar data={userActivityChartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No user activity data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;