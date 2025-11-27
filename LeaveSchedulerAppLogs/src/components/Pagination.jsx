import { ChevronLeft, ChevronRight } from 'lucide-react';

const pageSizes = [10, 20, 50, 100];

const Pagination = ({ currentPage, totalPages, totalElements, pageSize, onPageChange, onPageSizeChange }) => {
  if (totalPages <= 1) return null;

  const prev = () => currentPage > 0 && onPageChange(currentPage - 1);
  const next = () => currentPage < totalPages - 1 && onPageChange(currentPage + 1);

  const visiblePages = () => {
    const pages = [];
    const start = Math.max(0, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let p = start; p <= end; p++) pages.push(p);
    if (start > 0) pages.unshift(0);
    if (end < totalPages - 1) pages.push(totalPages - 1);
    return [...new Set(pages)];
  };

  return (
    <div className="pagination-bar">
      <div className="pagination-left">
        <span className="total-count">{totalElements.toLocaleString()} records</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
          className="page-size-select"
        >
          {pageSizes.map(s => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>
      <div className="pagination-controls">
        <button onClick={prev} disabled={currentPage === 0} className="page-btn" aria-label="Previous page">
          <ChevronLeft size={16} />
        </button>
        {visiblePages().map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`page-number ${p === currentPage ? 'active' : ''}`}
          >
            {p + 1}
          </button>
        ))}
        <button onClick={next} disabled={currentPage === totalPages - 1} className="page-btn" aria-label="Next page">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;