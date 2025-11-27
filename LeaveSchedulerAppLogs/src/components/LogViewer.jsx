// filepath: src/components/LogsViewer.js
import { Filter, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '../services/apiService';
import FilterPanel from './FilterPanel';
import LoadingSpinner from './LoadingSpinner';
import LogTable from './LogTable';
import Pagination from './Pagination';

const LogsViewer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 0,
    size: parseInt(searchParams.get('size')) || 20,
    sortBy: searchParams.get('sortBy') || 'timestamp',
    sortDir: searchParams.get('sortDir') || 'desc',
    operation: searchParams.get('operation') || '',
    userId: searchParams.get('userId') || '',
    username: searchParams.get('username') || '',
    status: searchParams.get('status') || '',
    httpMethod: searchParams.get('httpMethod') || '',
    entityType: searchParams.get('entityType') || '',
    department: searchParams.get('department') || '',
    ipAddress: searchParams.get('ipAddress') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || ''
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      // Special handling for CRITICAL operations - use dedicated endpoint
      if (filters.operation === 'CRITICAL') {
        response = await apiService.getCriticalOperations(filters.page, filters.size);
      } else {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        );
        response = await apiService.getLogs(params);
      }
      
      const content = response.content || [];
      setLogs(content);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setLogs([]);
      setTotalPages(0);
      setTotalElements(0);
      setError(`Failed to load logs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    // Only reset page to 0 if filters other than page/size are changed
    const shouldResetPage = Object.keys(newFilters).some(
      key => key !== 'page' && key !== 'size' && newFilters[key] !== filters[key]
    );
    
    const updatedFilters = { 
      ...filters, 
      ...newFilters,
      ...(shouldResetPage && !newFilters.hasOwnProperty('page') ? { page: 0 } : {})
    };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) params.set(key, value);
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) params.set(key, value);
    });
    setSearchParams(params);
  };

  const handleSort = (sortBy) => {
    const sortDir = filters.sortBy === sortBy && filters.sortDir === 'asc' ? 'desc' : 'asc';
    handleFilterChange({ sortBy, sortDir });
  };

  return (
    <div className="logs-viewer">
      <div className="logs-header">
        <div className="logs-title">
          <h1>Leave Scheduler Logs</h1>
          <p>Total: {totalElements.toLocaleString()} entries</p>
        </div>
        
        <div className="logs-actions">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
          >
            <Filter size={16} />
            Filters
          </button>
          
          <button onClick={fetchLogs} className="refresh-btn">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onApply={(applied) => handleFilterChange(applied)}
          onReset={() => handleFilterChange({
            operation: '',
            username: '',
            status: '',
            httpMethod: '',
            entityType: '',
            department: '',
            ipAddress: '',
            startDate: '',
            endDate: ''
          })}
          onClose={() => setShowFilters(false)}
        />
      )}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="error-message">
          <p>Error loading logs: {error}</p>
          <button onClick={fetchLogs} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : (
        <>
          <LogTable 
            logs={logs}
            onSort={handleSort}
            sortBy={filters.sortBy}
            sortDir={filters.sortDir}
          />
          
          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={filters.size}
            onPageChange={handlePageChange}
            onPageSizeChange={(size) => handleFilterChange({ size, page: 0 })}
          />
        </>
      )}
    </div>
  );
};

export default LogsViewer;