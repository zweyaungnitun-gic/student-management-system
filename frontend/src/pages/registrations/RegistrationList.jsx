import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Check, X, Search, Filter, ChevronLeft, ChevronRight, Users, Clock, CheckCircle, XCircle, FileText, User, Phone, Mail, Calendar } from 'lucide-react';
import { registrationService } from '../../api/registrationService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const RegistrationList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await registrationService.getAll();
      setRegistrations(data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleAction = async (e, id, action) => {
    e.stopPropagation();
    try {
      if (action === 'accept') {
        await registrationService.accept(id);
        toast.success('Application approved successfully');
      } else {
        await registrationService.reject(id);
        toast.success('Application rejected');
      }
      fetchRegistrations();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesStatus = r.registration_status === statusFilter;
    const matchesSearch = r.english_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.registration_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.national_id_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="status-badge warning"><Clock size={12} /> Pending</span>;
      case 'ACCEPTED':
        return <span className="status-badge success"><CheckCircle size={12} /> Approved</span>;
      case 'REJECTED':
        return <span className="status-badge danger"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="status-badge secondary">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return '-';
    }
  };

  // Statistics
  const pendingCount = registrations.filter(r => r.registration_status === 'PENDING').length;
  const approvedCount = registrations.filter(r => r.registration_status === 'ACCEPTED').length;
  const rejectedCount = registrations.filter(r => r.registration_status === 'REJECTED').length;

  if (loading && registrations.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <FileText size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Student Registrations</h1>
            <p className="header-subtitle">Review and process incoming student registration applications</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card" onClick={() => setStatusFilter('PENDING')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon yellow">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{pendingCount}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setStatusFilter('ACCEPTED')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{approvedCount}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setStatusFilter('REJECTED')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon red">
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{rejectedCount}</h3>
            <p>Rejected</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{registrations.length}</h3>
            <p>Total Applications</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-form">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code, or national ID..."
            />
          </div>
        </div>
        <div className="filter-actions">
          <button 
            className={`btn-filter ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Status</label>
            <div className="filter-buttons">
              <button 
                className={`filter-chip ${statusFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending
              </button>
              <button 
                className={`filter-chip ${statusFilter === 'ACCEPTED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ACCEPTED')}
              >
                Approved
              </button>
              <button 
                className={`filter-chip ${statusFilter === 'REJECTED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('REJECTED')}
              >
                Rejected
              </button>
            </div>
          </div>
          <div className="filter-actions-group">
            <button className="btn-clear-filters" onClick={() => { setSearchTerm(''); setStatusFilter('PENDING'); setShowFilters(false); }}>
              <X size={16} />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}

      {/* Registrations Table */}
      {paginatedRegistrations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No registrations found</h3>
          <p>No {statusFilter.toLowerCase()} applications match your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="registrations-table-container">
            <table className="registrations-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Applicant</th>
                  <th>National ID</th>
                  <th>Phone</th>
                  <th>Submitted</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRegistrations.map(reg => (
                  <tr key={reg.id} onClick={() => navigate(`/registrations/${reg.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="app-id">
                        <span className="code">{reg.registration_code}</span>
                      </div>
                    </td>
                    <td>
                      <div className="applicant-info">
                        <div className="applicant-avatar">
                          {(reg.english_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="applicant-details">
                          <span className="applicant-name">{reg.english_name}</span>
                          <span className="applicant-email">{reg.katakana_name}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="national-id">{reg.national_id_number || '-'}</span>
                    </td>
                    <td>
                      <div className="phone-info">
                        <Phone size={12} />
                        <span>{reg.phone_number || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <Calendar size={12} />
                        <span>{formatDate(reg.submitted_at)}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      {getStatusBadge(reg.registration_status)}
                    </td>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      {reg.registration_status === 'PENDING' ? (
                        <div className="action-buttons">
                          <button
                            className="btn-icon approve"
                            onClick={(e) => handleAction(e, reg.id, 'accept')}
                            title="Approve Application"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="btn-icon reject"
                            onClick={(e) => handleAction(e, reg.id, 'reject')}
                            title="Reject Application"
                          >
                            <X size={16} />
                          </button>
                          <button
                            className="btn-icon view"
                            onClick={(e) => { e.stopPropagation(); navigate(`/registrations/${reg.id}`); }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-icon view"
                          onClick={(e) => { e.stopPropagation(); navigate(`/registrations/${reg.id}`); }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .registration-module {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .module-header {
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 24px;
          padding: 2rem;
          margin-bottom: 2rem;
          color: white;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .header-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
        }

        .header-subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.yellow { background: #fff3e0; color: #ed6c02; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.red { background: #ffebee; color: #c62828; }
        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }

        .stat-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .stat-info p {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .search-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-form {
          flex: 1;
          max-width: 400px;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #0f6cbd;
          box-shadow: 0 0 0 3px rgba(15, 108, 189, 0.1);
        }

        .filter-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-filter {
          padding: 0.75rem 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-filter.active {
          background: #0f6cbd;
          color: white;
          border-color: #0f6cbd;
        }

        .filter-panel {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group label {
          font-weight: 500;
          color: #334155;
          font-size: 0.85rem;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-chip {
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
        }

        .filter-chip.active {
          background: #0f6cbd;
          color: white;
        }

        .btn-clear-filters {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #dc2626;
          font-size: 0.8rem;
        }

        .btn-clear-filters:hover {
          background: #fef2f2;
          border-color: #dc2626;
        }

        .registrations-table-container {
          background: white;
          border-radius: 20px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .registrations-table {
          width: 100%;
          border-collapse: collapse;
        }

        .registrations-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
        }

        .registrations-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .registrations-table tr:hover {
          background: #f8fafc;
        }

        .app-id .code {
          font-family: monospace;
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f6cbd;
          background: #e3f2fd;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .applicant-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .applicant-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .applicant-details {
          display: flex;
          flex-direction: column;
        }

        .applicant-name {
          font-weight: 500;
          color: #1e293b;
        }

        .applicant-email {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .national-id {
          font-family: monospace;
          font-size: 0.8rem;
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .phone-info, .date-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #64748b;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.warning {
          background: #fff3e0;
          color: #ed6c02;
        }

        .status-badge.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.danger {
          background: #ffebee;
          color: #c62828;
        }

        .status-badge.secondary {
          background: #e2e8f0;
          color: #475569;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .btn-icon {
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .btn-icon.approve {
          color: #10b981;
        }

        .btn-icon.approve:hover {
          background: #d1fae5;
        }

        .btn-icon.reject {
          color: #dc2626;
        }

        .btn-icon.reject:hover {
          background: #fee2e2;
        }

        .btn-icon.view {
          color: #0f6cbd;
        }

        .btn-icon.view:hover {
          background: #e3f2fd;
        }

        .text-center {
          text-align: center;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 24px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .empty-state p {
          color: #64748b;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }

        .page-btn {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-btn:not(:disabled):hover {
          background: #f1f5f9;
          border-color: #0f6cbd;
        }

        .page-numbers {
          display: flex;
          gap: 0.25rem;
        }

        .page-num {
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-num.active {
          background: #0f6cbd;
          color: white;
          border-color: #0f6cbd;
        }

        .page-num:hover:not(.active) {
          background: #f1f5f9;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0f6cbd;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .registration-module {
            padding: 1rem;
          }
          
          .module-header {
            padding: 1.5rem;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filter-panel {
            flex-direction: column;
          }
          
          .filter-group {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationList;