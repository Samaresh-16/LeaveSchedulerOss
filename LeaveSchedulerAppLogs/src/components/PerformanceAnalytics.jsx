import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ClockIcon,
  CpuChipIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import { format, subDays, subHours } from 'date-fns';
import { useEffect, useState } from 'react';
import { Bar, Line, Scatter } from 'react-chartjs-2';
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
  PointElement,
  LineElement,
  TimeScale
);

const PerformanceAnalytics = () => {
  const [slowOperations, setSlowOperations] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [hourlyPerformance, setHourlyPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreshold, setSelectedThreshold] = useState(5000);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');

  const thresholds = [
    { value: 1000, label: '1 second' },
    { value: 3000, label: '3 seconds' },
    { value: 5000, label: '5 seconds' },
    { value: 10000, label: '10 seconds' }
  ];

  const periods = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  useEffect(() => {
    fetchPerformanceData();
  }, [selectedThreshold, selectedPeriod]);

  // Helper function to calculate percentile
  const calculatePercentile = (values, percentile) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * (percentile / 100)) - 1;
    return sorted[Math.max(0, index)];
  };

  // Helper function to calculate performance metrics from logs
  const calculatePerformanceMetrics = (logs, slowOpsCount) => {
    const executionTimes = logs
      .filter(log => log.executionTimeMs != null && log.executionTimeMs > 0)
      .map(log => log.executionTimeMs);
    
    if (executionTimes.length === 0) {
      return {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        throughputPerMinute: 0,
        errorRate: '0',
        slowOperationsCount: slowOpsCount
      };
    }
    
    const avgResponseTime = Math.floor(
      executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
    );
    
    const p95 = calculatePercentile(executionTimes, 95);
    const p99 = calculatePercentile(executionTimes, 99);
    
    const failures = logs.filter(log => log.status === 'FAILURE').length;
    const errorRate = ((failures / logs.length) * 100).toFixed(2);
    
    // Calculate throughput (requests per minute based on time range)
    const oldestLog = logs[logs.length - 1];
    const newestLog = logs[0];
    if (oldestLog && newestLog && oldestLog.timestamp && newestLog.timestamp) {
      const oldestTime = oldestLog.timestamp.endsWith('Z') ? oldestLog.timestamp : oldestLog.timestamp + 'Z';
      const newestTime = newestLog.timestamp.endsWith('Z') ? newestLog.timestamp : newestLog.timestamp + 'Z';
      const timeRangeMs = new Date(newestTime) - new Date(oldestTime);
      const timeRangeMinutes = Math.max(1, timeRangeMs / 60000);
      const throughputPerMinute = Math.floor(logs.length / timeRangeMinutes);
      
      return {
        averageResponseTime: avgResponseTime,
        p95ResponseTime: Math.floor(p95),
        p99ResponseTime: Math.floor(p99),
        throughputPerMinute,
        errorRate,
        slowOperationsCount: slowOpsCount
      };
    }
    
    return {
      averageResponseTime: avgResponseTime,
      p95ResponseTime: Math.floor(p95),
      p99ResponseTime: Math.floor(p99),
      throughputPerMinute: logs.length,
      errorRate,
      slowOperationsCount: slowOpsCount
    };
  };

  // Helper function to calculate hourly performance trends
  const calculateHourlyPerformance = (logs, period) => {
    const timeGroups = {};
    const now = new Date();
    
    // Initialize time buckets
    const buckets = period === '24h' ? 24 : period === '7d' ? 7 : 30;
    for (let i = buckets - 1; i >= 0; i--) {
      const date = period === '24h' ? subHours(now, i) : subDays(now, i);
      const key = format(date, period === '24h' ? 'HH:00' : 'MMM dd');
      timeGroups[key] = {
        time: key,
        avgResponseTime: 0,
        requestCount: 0,
        errorCount: 0,
        p95ResponseTime: 0,
        throughput: 0,
        executionTimes: []
      };
    }
    
    // Process logs into time buckets
    logs.forEach(log => {
      if (!log.timestamp) return;
      const utcTime = log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z';
      const logDate = new Date(utcTime);
      const key = format(logDate, period === '24h' ? 'HH:00' : 'MMM dd', { timeZone: 'Asia/Kolkata' });
      
      if (timeGroups[key]) {
        timeGroups[key].requestCount++;
        if (log.status === 'FAILURE') {
          timeGroups[key].errorCount++;
        }
        if (log.executionTimeMs != null && log.executionTimeMs > 0) {
          timeGroups[key].executionTimes.push(log.executionTimeMs);
        }
      }
    });
    
    // Calculate averages and percentiles
    return Object.values(timeGroups).map(group => {
      if (group.executionTimes.length > 0) {
        group.avgResponseTime = Math.floor(
          group.executionTimes.reduce((a, b) => a + b, 0) / group.executionTimes.length
        );
        group.p95ResponseTime = calculatePercentile(group.executionTimes, 95);
      }
      delete group.executionTimes; // Remove raw data
      group.throughput = group.requestCount;
      return group;
    });
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [slowOps, allLogs] = await Promise.all([
        apiService.getSlowOperations(selectedThreshold, 0, 20),
        apiService.getLogs({ page: 0, size: 1000, sortBy: 'timestamp', sortDir: 'desc' })
      ]);
      
      const slowOpsContent = slowOps.content || [];
      const logsContent = allLogs.content || [];
      
      setSlowOperations(slowOpsContent);
      
      // Calculate real metrics from actual data
      const metrics = calculatePerformanceMetrics(logsContent, slowOps.totalElements || 0);
      setPerformanceMetrics(metrics);
      
      // Calculate hourly performance trends
      const hourly = calculateHourlyPerformance(logsContent, selectedPeriod);
      setHourlyPerformance(hourly);
      
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };



  // Chart configurations
  const responseTimeChartData = {
    labels: hourlyPerformance.map(h => h.time),
    datasets: [
      {
        label: 'Average Response Time (ms)',
        data: hourlyPerformance.map(h => h.avgResponseTime),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'P95 Response Time (ms)',
        data: hourlyPerformance.map(h => h.p95ResponseTime),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
    ],
  };

  const throughputChartData = {
    labels: hourlyPerformance.map(h => h.time),
    datasets: [
      {
        label: 'Request Count',
        data: hourlyPerformance.map(h => h.requestCount),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
      },
      {
        label: 'Error Count',
        data: hourlyPerformance.map(h => h.errorCount),
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
        borderWidth: 1,
      },
    ],
  };

  const slowOperationsChartData = {
    labels: slowOperations.slice(0, 10).map(op => 
      op.operation?.substring(0, 15) + (op.operation?.length > 15 ? '...' : '') || 'Unknown'
    ),
    datasets: [
      {
        label: 'Execution Time (ms)',
        data: slowOperations.slice(0, 10).map(op => op.executionTimeMs || 0),
        backgroundColor: slowOperations.slice(0, 10).map(op => 
          op.executionTimeMs > 10000 ? '#DC2626' : 
          op.executionTimeMs > 5000 ? '#F59E0B' : '#3B82F6'
        ),
        borderColor: slowOperations.slice(0, 10).map(op => 
          op.executionTimeMs > 10000 ? '#B91C1C' : 
          op.executionTimeMs > 5000 ? '#D97706' : '#2563EB'
        ),
        borderWidth: 1,
      },
    ],
  };

  const performanceScatterData = {
    datasets: [
      {
        label: 'Response Time vs Request Volume',
        data: hourlyPerformance.map(h => ({
          x: h.requestCount,
          y: h.avgResponseTime
        })),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3B82F6',
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
        title: {
          display: true,
          text: 'Response Time (ms)'
        }
      },
    },
  };

  const dualAxisOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        display: true,
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Response Time (ms)'
        }
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      },
    },
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Performance Correlation Analysis'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Request Count'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Average Response Time (ms)'
        }
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor application performance, response times, and throughput metrics
          </p>
        </div>
        <div className="flex space-x-4">
          {/* Threshold Selector */}
          <select
            value={selectedThreshold}
            onChange={(e) => setSelectedThreshold(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Slow Operations Threshold</option>
            {thresholds.map(threshold => (
              <option key={threshold.value} value={threshold.value}>
                {threshold.label}
              </option>
            ))}
          </select>
          
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
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Avg Response</p>
              <p className="text-lg font-semibold text-gray-900">
                {performanceMetrics.averageResponseTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
              <BoltIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">P95 Response</p>
              <p className="text-lg font-semibold text-gray-900">
                {performanceMetrics.p95ResponseTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">P99 Response</p>
              <p className="text-lg font-semibold text-gray-900">
                {performanceMetrics.p99ResponseTime}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Throughput</p>
              <p className="text-lg font-semibold text-gray-900">
                {performanceMetrics.throughputPerMinute}/min
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Error Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {performanceMetrics.errorRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg">
              <CpuChipIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Slow Ops</p>
              <p className="text-lg font-semibold text-gray-900">
                {performanceMetrics.slowOperationsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trends</h3>
          <Line data={responseTimeChartData} options={dualAxisOptions} />
        </div>

        {/* Request Volume and Errors */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Volume & Errors</h3>
          <Bar data={throughputChartData} options={barOptions} />
        </div>

        {/* Slowest Operations */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Slowest Operations (&gt;{selectedThreshold}ms)
          </h3>
          {slowOperations.length > 0 ? (
            <Bar data={slowOperationsChartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No slow operations found
            </div>
          )}
        </div>

        {/* Performance Correlation */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Correlation Analysis</h3>
          <Scatter data={performanceScatterData} options={scatterOptions} />
        </div>
      </div>

      {/* Slow Operations Table */}
      {slowOperations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Slow Operations Details (&gt;{selectedThreshold}ms)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Execution Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slowOperations.slice(0, 10).map((operation, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {operation.operation || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        operation.executionTimeMs > 10000 
                          ? 'bg-red-100 text-red-800'
                          : operation.executionTimeMs > 5000
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {operation.executionTimeMs}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {operation.username || operation.userId || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {operation.timestamp ? format(new Date(operation.timestamp.endsWith('Z') ? operation.timestamp : operation.timestamp + 'Z'), 'MMM dd, HH:mm:ss') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        operation.status === 'SUCCESS' 
                          ? 'bg-green-100 text-green-800'
                          : operation.status === 'FAILURE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {operation.status || 'UNKNOWN'}
                      </span>
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

export default PerformanceAnalytics;