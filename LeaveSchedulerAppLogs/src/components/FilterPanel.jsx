import { Check, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';

const statuses = ['SUCCESS', 'FAILURE', 'WARNING', 'INFO'];
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];

const FilterPanel = ({ filters, onApply, onReset, onClose }) => {
  const [local, setLocal] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocal(prev => ({ ...prev, [name]: value }));
  };

  const apply = () => {
    onApply(local);
  };

  const reset = () => {
    const cleared = {
      operation: '',
      username: '',
      status: '',
      httpMethod: '',
      entityType: '',
      department: '',
      ipAddress: '',
      startDate: '',
      endDate: ''
    };
    setLocal(cleared);
    onReset();
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2>Filters</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close filters">
          <X size={16} />
        </button>
      </div>
      <div className="filter-body">
        <div className="filter-grid">
          <div className="filter-field">
            <label>Operation</label>
            <input name="operation" value={local.operation} onChange={handleChange} placeholder="e.g. LOGIN" />
          </div>
          <div className="filter-field">
            <label>User Name</label>
            <input name="username" value={local.username} onChange={handleChange} placeholder="e.g. alice" />
          </div>
          <div className="filter-field">
            <label>Status</label>
            <select name="status" value={local.status} onChange={handleChange}>
              <option value="">Any</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-field">
            <label>HTTP Method</label>
            <select name="httpMethod" value={local.httpMethod} onChange={handleChange}>
              <option value="">Any</option>
              {httpMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="filter-field">
            <label>Entity Type</label>
            <input name="entityType" value={local.entityType} onChange={handleChange} placeholder="e.g. User" />
          </div>
          <div className="filter-field">
            <label>Department</label>
            <input name="department" value={local.department} onChange={handleChange} placeholder="e.g. HR" />
          </div>
          <div className="filter-field">
            <label>IP Address</label>
            <input name="ipAddress" value={local.ipAddress} onChange={handleChange} placeholder="e.g. 192.168.0.5" />
          </div>
          <div className="filter-field">
            <label>Start Date</label>
            <input type="datetime-local" name="startDate" value={local.startDate} onChange={handleChange} />
          </div>
          <div className="filter-field">
            <label>End Date</label>
            <input type="datetime-local" name="endDate" value={local.endDate} onChange={handleChange} />
          </div>
        </div>
      </div>
      <div className="filter-footer">
        <button className="btn-secondary" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
        <button className="btn-primary" onClick={apply}>
          <Check size={14} /> Apply
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;