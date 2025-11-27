// filepath: src/components/LogTable.js
import { formatDistanceToNow } from 'date-fns';
import { Activity, ChevronDown, ChevronUp, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const LogTable = ({ logs, onSort, sortBy, sortDir }) => {
  // Convert UTC timestamp to IST (UTC+5:30)
  const convertToIST = (timestamp) => {
    // Append 'Z' to treat as UTC if not already present
    const utcTime = timestamp.endsWith('Z') ? timestamp : timestamp + 'Z';
    return new Date(utcTime);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortDir === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'green';
      case 'FAILURE': return 'red';
      case 'WARNING': return 'orange';
      default: return 'blue';
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="log-table-container">
      <table className="log-table">
        <thead>
          <tr>
            <th onClick={() => onSort('timestamp')} className="sortable">
              <div className="th-content">
                <Clock size={16} />
                <span>Timestamp</span>
                {getSortIcon('timestamp')}
              </div>
            </th>
            <th onClick={() => onSort('operation')} className="sortable">
              <div className="th-content">
                <Activity size={16} />
                <span>Operation</span>
                {getSortIcon('operation')}
              </div>
            </th>
            <th onClick={() => onSort('status')} className="sortable">
              <div className="th-content">
                <span>Status</span>
                {getSortIcon('status')}
              </div>
            </th>
            <th onClick={() => onSort('username')} className="sortable">
              <div className="th-content">
                <User size={16} />
                <span>User</span>
                {getSortIcon('username')}
              </div>
            </th>
            <th>Message</th>
            <th>Duration</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <tr key={log.id} className="log-row">
                <td className="timestamp-cell">
                  <div className="timestamp">
                    <div className="time-main">
                      {convertToIST(log.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </div>
                    <div className="time-sub">
                      {convertToIST(log.timestamp).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </div>
                    <div className="time-relative">
                      {formatDistanceToNow(convertToIST(log.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                </td>
                
                <td className="operation-cell">
                  <div className="operation-info">
                    <div className="operation-name">{log.operation}</div>
                    {log.httpMethod && (
                      <div className="http-method">
                        <span className={`method-badge method-${log.httpMethod.toLowerCase()}`}>
                          {log.httpMethod}
                        </span>
                      </div>
                    )}
                    {log.entityType && (
                      <div className="entity-type">{log.entityType}</div>
                    )}
                  </div>
                </td>
                
                <td className="status-cell">
                  <span className={`status-badge status-${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                
                <td className="user-cell">
                  <div className="user-info">
                    <div className="username">{log.username || 'Anonymous'}</div>
                    {log.department && (
                      <div className="department">{log.department}</div>
                    )}
                    {log.ipAddress && (
                      <div className="ip-address">{log.ipAddress}</div>
                    )}
                  </div>
                </td>
                
                <td className="message-cell">
                  <div className="message" title={log.message}>
                    {truncateText(log.message)}
                  </div>
                </td>
                
                <td className="duration-cell">
                  {log.executionTimeMs ? (
                    <div className={`duration ${log.executionTimeMs > 5000 ? 'slow' : ''}`}>
                      {log.executionTimeMs}ms
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                
                <td className="actions-cell">
                  <Link 
                    to={`/logs/${log.id}`} 
                    className="view-details-btn"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data-cell">
                <div className="no-data compact">
                  <Activity size={32} />
                  <p>No log entries match current filters.</p>
                  <button className="retry-btn" onClick={() => window.location.reload()}>Reload</button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;