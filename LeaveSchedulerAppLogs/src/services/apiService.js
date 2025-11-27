// filepath: src/services/apiService.js
import axios from 'axios';


// Use proxy in development, direct URL in production
const API_BASE = import.meta.env.DEV 
  ? '/api/app-logs'  // Use proxy in development
  : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/app-logs`;

// Configure axios defaults
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status === 404) {
      console.error('API endpoint not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

/**
 * Transform Spring HATEOAS HAL response to standard pagination format
 * Converts from HAL format to the format expected by frontend components
 */
const transformHalResponse = (halResponse) => {
  // If response is already in old format, return as-is (backward compatibility)
  if (halResponse.content) {
    return halResponse;
  }

  // Transform HAL format to expected format
  return {
    content: halResponse._embedded?.appLogList || [],
    totalElements: halResponse.page?.totalElements || 0,
    totalPages: halResponse.page?.totalPages || 0,
    size: halResponse.page?.size || 20,
    number: halResponse.page?.number || 0,
    pageable: {
      pageNumber: halResponse.page?.number || 0,
      pageSize: halResponse.page?.size || 20
    }
  };
};

const apiService = {
    // Get logs with filtering and pagination
    getLogs: async (params = {}) => {
        const response = await axios.get(API_BASE, { params });
        return transformHalResponse(response.data);
    },

    // Get dashboard statistics
    getDashboardData: async () => {
        const response = await axios.get(`${API_BASE}/dashboard`);
        return response.data;
    },

    // Get detailed statistics
    getStatistics: async () => {
        const response = await axios.get(`${API_BASE}/statistics`);
        return response.data;
    },

    // Get recent failures
    getRecentFailures: async (page = 0, size = 10) => {
        const response = await axios.get(`${API_BASE}/recent-failures`, {
            params: { page, size }
        });
        return transformHalResponse(response.data);
    },

    // Get authentication logs
    getAuthenticationLogs: async (page = 0, size = 20) => {
        const response = await axios.get(`${API_BASE}/authentication`, {
            params: { page, size }
        });
        return transformHalResponse(response.data);
    },

    // Get critical operations
    getCriticalOperations: async (page = 0, size = 20) => {
        const response = await axios.get(`${API_BASE}/critical`, {
            params: { page, size }
        });
        return transformHalResponse(response.data);
    },

    // Get slow operations
    getSlowOperations: async (thresholdMs = 5000, page = 0, size = 10) => {
        const response = await axios.get(`${API_BASE}/slow-operations`, {
            params: { thresholdMs, page, size }
        });
        return transformHalResponse(response.data);
    },

    // Get logs by correlation ID
    getLogsByCorrelationId: async (correlationId) => {
        const response = await axios.get(`${API_BASE}/trace/${correlationId}`);
        return response.data;
    },

    // Get specific log by ID
    getLogById: async (id) => {
        const response = await axios.get(`${API_BASE}/${id}`);
        return response.data;
    },

    // Cleanup old logs
    cleanupOldLogs: async (daysToKeep = 90) => {
        const response = await axios.delete(`${API_BASE}/cleanup`, {
            params: { daysToKeep }
        });
        return response.data;
    }
};

export default apiService;