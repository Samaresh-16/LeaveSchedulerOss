import { AlertTriangle, ArrowLeft, CheckCircle, Clock, Info, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiService from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';

const LogDetail = () => {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getLogById(id);
        setLog(response);
      } catch (err) {
        setError(`Failed to load log details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="log-detail-error">
        <div className="error-message">
          <AlertTriangle size={48} />
          <p>{error}</p>
          <Link to="/logs" className="btn-primary">
            <ArrowLeft size={16} /> Back to Logs
          </Link>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="log-detail-error">
        <div className="error-message">
          <Info size={48} />
          <p>Log entry not found</p>
          <Link to="/logs" className="btn-primary">
            <ArrowLeft size={16} /> Back to Logs
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (log.status) {
      case 'SUCCESS': return <CheckCircle size={24} className="status-icon-success" />;
      case 'FAILURE': return <XCircle size={24} className="status-icon-failure" />;
      case 'WARNING': return <AlertTriangle size={24} className="status-icon-warning" />;
      default: return <Info size={24} className="status-icon-info" />;
    }
  };

  const getStatusClass = () => {
    switch (log.status) {
      case 'SUCCESS': return 'green';
      case 'FAILURE': return 'red';
      case 'WARNING': return 'orange';
      default: return 'blue';
    }
  };

  return (
    <div className="log-detail-container">
      <div className="log-detail-header">
        <Link to="/logs" className="back-link">
          <ArrowLeft size={20} /> Back to Logs
        </Link>
        <h1>Log Details</h1>
      </div>

      <div className="log-detail-content">
        <div className="log-detail-card">
          <div className="log-detail-status">
            {getStatusIcon()}
            <div>
              <span className={`status-badge-large status-${getStatusClass()}`}>
                {log.status}
              </span>
              <p className="log-detail-timestamp">
                {new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>
          </div>

          <div className="log-detail-grid">
            <div className="detail-item">
              <label>Operation</label>
              <div className="detail-value">{log.operation || '-'}</div>
            </div>

            <div className="detail-item">
              <label>User</label>
              <div className="detail-value">{log.username || 'Anonymous'}</div>
            </div>

            <div className="detail-item">
              <label>User ID</label>
              <div className="detail-value">{log.userId || '-'}</div>
            </div>

            <div className="detail-item">
              <label>HTTP Method</label>
              <div className="detail-value">
                {log.httpMethod && (
                  <span className={`method-badge method-${log.httpMethod.toLowerCase()}`}>
                    {log.httpMethod}
                  </span>
                )}
                {!log.httpMethod && '-'}
              </div>
            </div>

            <div className="detail-item">
              <label>Entity Type</label>
              <div className="detail-value">{log.entityType || '-'}</div>
            </div>

            <div className="detail-item">
              <label>Department</label>
              <div className="detail-value">{log.department || '-'}</div>
            </div>

            <div className="detail-item">
              <label>IP Address</label>
              <div className="detail-value detail-code">{log.ipAddress || '-'}</div>
            </div>

            <div className="detail-item">
              <label>Execution Time</label>
              <div className="detail-value">
                {log.executionTimeMs ? (
                  <span className={`duration ${log.executionTimeMs > 5000 ? 'slow' : ''}`}>
                    <Clock size={14} /> {log.executionTimeMs}ms
                  </span>
                ) : '-'}
              </div>
            </div>
          </div>

          {log.message && (
            <div className="detail-item-full">
              <label>Message</label>
              <div className="detail-value-block">{log.message}</div>
            </div>
          )}

          {log.errorDetails && (
            <div className="detail-item-full">
              <label>Error Details</label>
              <div className="detail-value-block detail-error">
                <pre>{log.errorDetails}</pre>
              </div>
            </div>
          )}

          {log.requestBody && (
            <div className="detail-item-full">
              <label>Request Body</label>
              <div className="detail-value-block detail-code">
                <pre>{JSON.stringify(JSON.parse(log.requestBody), null, 2)}</pre>
              </div>
            </div>
          )}

          {log.responseBody && (
            <div className="detail-item-full">
              <label>Response Body</label>
              <div className="detail-value-block detail-code">
                <pre>{JSON.stringify(JSON.parse(log.responseBody), null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="log-detail-metadata">
            <div className="metadata-item">
              <label>Log ID</label>
              <span className="detail-code">{log.id}</span>
            </div>
            <div className="metadata-item">
              <label>Created</label>
              <span>{new Date(log.timestamp.endsWith('Z') ? log.timestamp : log.timestamp + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetail;
