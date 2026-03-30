import React, { useState } from 'react';

/**
 * AdminTable — matches the exact table design from admin-dashboard.html:
 *   Row 1: #0F6CBD blue header with title
 *   Row 2: #B4D6FA light-blue column headers
 *   Body:  #B4D6FA rows, hover #9ac2f8
 */
const AdminTable = ({ title, columns, data, onRowClick, searchPlaceholder = 'Search...', actionButton }) => {
  const [query, setQuery] = useState('');

  const filtered = data.filter(row =>
    columns.some(col => String(row[col.accessor] ?? '').toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="table-responsive shadow-sm rounded-3 overflow-hidden">
      <table className="table admin-table mb-0 align-middle">
        <thead>
          {/* Row 1 — Blue title bar */}
          <tr className="table-title-header">
            <th colSpan={columns.length}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">{title}</h5>
                <div className="d-flex gap-2 align-items-center">
                  {/* Search input inside the blue header */}
                  <div className="input-group input-group-sm" style={{ maxWidth: '260px' }}>
                    <span className="input-group-text bg-white border-0">
                      <i className="bi bi-search text-muted" style={{ fontSize: '0.8rem' }}></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 shadow-none"
                      placeholder={searchPlaceholder}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      style={{ fontSize: '0.875rem' }}
                    />
                  </div>
                  {actionButton}
                </div>
              </div>
            </th>
          </tr>

          {/* Row 2 — Light-blue column headers */}
          <tr className="table-col-header">
            {columns.map((col, i) => (
              <th key={i} scope="col">{col.header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 ? (
            <tr style={{ background: 'white' }}>
              <td colSpan={columns.length} className="text-center text-muted py-5">
                No records found.
              </td>
            </tr>
          ) : (
            filtered.map((row, ri) => (
              <tr key={ri} onClick={() => onRowClick && onRowClick(row)}>
                {columns.map((col, ci) => (
                  <td key={ci}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div id="pagination" className="d-flex justify-content-between align-items-center px-3 py-2 bg-white border-top">
        <small className="text-muted">
          Showing <strong>{Math.min(filtered.length, 10)}</strong> of <strong>{filtered.length}</strong> entries
        </small>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled"><a className="page-link" href="#">«</a></li>
            <li className="page-item active"><a className="page-link" href="#">1</a></li>
            <li className="page-item disabled"><a className="page-link" href="#">»</a></li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminTable;
