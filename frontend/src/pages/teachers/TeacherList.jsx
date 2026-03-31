import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Info, PlayCircle, PauseCircle, Mail, Phone, Building2, Calendar, Search, X, Filter, ChevronLeft, ChevronRight, User, MoreVertical } from 'lucide-react';
import { teacherService } from '../../api/teacherService';
import toast from 'react-hot-toast';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll(search);
      let data = response || [];
      
      // Apply status filter
      if (filterStatus !== 'all') {
        data = data.filter(teacher => 
          filterStatus === 'active' ? teacher.is_active : !teacher.is_active
        );
      }
      
      setTeachers(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [search, filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
  };

  const handleToggleActive = async (teacherId, isActive) => {
    try {
      if (isActive) {
        await teacherService.deactivate(teacherId);
        toast.success('Teacher deactivated');
      } else {
        await teacherService.activate(teacherId);
        toast.success('Teacher activated');
      }
      fetchTeachers();
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (teacherId, teacherName) => {
    if (window.confirm(`Are you sure you want to delete "${teacherName}"? This action cannot be undone.`)) {
      try {
        await teacherService.delete(teacherId);
        toast.success(`Teacher "${teacherName}" deleted successfully`);
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(teachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeachers = teachers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="badge-status active">
          <span className="status-dot"></span>
          Active
        </span>
      );
    }
    return (
      <span className="badge-status inactive">
        <span className="status-dot"></span>
        Inactive
      </span>
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomGradient = (id) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    ];
    return gradients[id % gradients.length];
  };

  if (loading && teachers.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <User size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Teacher Management</h1>
            <p className="header-subtitle">Manage faculty and staff records, track assignments, and monitor performance</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon bg-primary-light">
            <User size={24} />
          </div>
          <div className="stat-info">
            <h3>{teachers.length}</h3>
            <p>Total Teachers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-success-light">
            <PlayCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{teachers.filter(t => t.is_active).length}</h3>
            <p>Active Teachers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-warning-light">
            <PauseCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{teachers.filter(t => !t.is_active).length}</h3>
            <p>Inactive Teachers</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or ID..."
            />
            {searchInput && (
              <button type="button" className="clear-search" onClick={handleClear}>
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-search">
            Search
          </button>
        </form>

        <div className="filter-actions">
          <button 
            className={`btn-filter ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button
            className="btn-add"
            onClick={() => navigate('/teachers/new')}
          >
            <Plus size={18} />
            <span>Add Teacher</span>
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
                className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                Active Only
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'inactive' ? 'active' : ''}`}
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive Only
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teachers Grid */}
      {paginatedTeachers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👩‍🏫</div>
          <h3>No teachers found</h3>
          <p>Try adjusting your search or filters, or add a new teacher.</p>
          <button className="btn-add-primary" onClick={() => navigate('/teachers/new')}>
            <Plus size={18} />
            <span>Add Your First Teacher</span>
          </button>
        </div>
      ) : (
        <>
          <div className="teachers-grid">
            {paginatedTeachers.map(teacher => (
              <div key={teacher.teacher_id || teacher.teacherId} className="teacher-card">
                <div className="card-header">
                  <div className="avatar" style={{ background: getRandomGradient(teacher.teacher_id || teacher.teacherId) }}>
                    {getInitials(teacher.name)}
                  </div>
                  <div className="header-info">
                    <h3 className="teacher-name">{teacher.name}</h3>
                    <span className="teacher-code">{teacher.teacher_code || teacher.teacherCode}</span>
                  </div>
                  <div className="header-actions">
                    <div className="dropdown">
                      <button className="dropdown-trigger">
                        <MoreVertical size={18} />
                      </button>
                      <div className="dropdown-menu">
                        <button onClick={() => navigate(`/teachers/${teacher.teacher_id || teacher.teacherId}`)}>
                          <Info size={16} />
                          View Details
                        </button>
                        <button onClick={() => navigate(`/teachers/${teacher.teacher_id || teacher.teacherId}/edit`)}>
                          <Pencil size={16} />
                          Edit
                        </button>
                        {teacher.is_active ? (
                          <button onClick={() => handleToggleActive(teacher.teacher_id || teacher.teacherId, true)}>
                            <PauseCircle size={16} />
                            Deactivate
                          </button>
                        ) : (
                          <button onClick={() => handleToggleActive(teacher.teacher_id || teacher.teacherId, false)}>
                            <PlayCircle size={16} />
                            Activate
                          </button>
                        )}
                        <button className="danger" onClick={() => handleDelete(teacher.teacher_id || teacher.teacherId, teacher.name)}>
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="info-row">
                    <Mail size={16} />
                    <a href={`mailto:${teacher.email}`} className="email-link">{teacher.email}</a>
                  </div>
                  {teacher.department && (
                    <div className="info-row">
                      <Building2 size={16} />
                      <span>{teacher.department}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <Calendar size={16} />
                    <span>Joined {formatDate(teacher.created_at || teacher.createdAt)}</span>
                  </div>
                </div>
                
                <div className="card-footer">
                  {getStatusBadge(teacher.is_active)}
                  <button 
                    className="btn-details"
                    onClick={() => navigate(`/teachers/${teacher.teacher_id || teacher.teacherId}`)}
                  >
                    View Profile
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
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
        .teacher-module {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header */
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

        /* Stats Row */
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

        .bg-primary-light { background: #e3f2fd; color: #1976d2; }
        .bg-success-light { background: #e8f5e9; color: #2e7d32; }
        .bg-warning-light { background: #fff3e0; color: #ed6c02; }

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

        /* Search and Filter */
        .search-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-form {
          display: flex;
          gap: 0.75rem;
          flex: 1;
          max-width: 500px;
        }

        .search-input-wrapper {
          flex: 1;
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
          padding: 0.75rem 2rem 0.75rem 2.5rem;
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

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0;
          display: flex;
        }

        .btn-search {
          padding: 0.75rem 1.5rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-search:hover {
          background: #0a58a0;
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

        .btn-add {
          padding: 0.75rem 1.5rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-add:hover {
          background: #059669;
        }

        /* Filter Panel */
        .filter-panel {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
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

        /* Teachers Grid */
        .teachers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .teacher-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .teacher-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          padding: 1.25rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .header-info {
          flex: 1;
        }

        .teacher-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #0f172a;
        }

        .teacher-code {
          font-size: 0.75rem;
          color: #64748b;
          background: #e2e8f0;
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
        }

        .header-actions {
          position: relative;
        }

        .dropdown-trigger {
          padding: 0.5rem;
          background: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .dropdown-trigger:hover {
          background: #e2e8f0;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          min-width: 160px;
          z-index: 10;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px);
          transition: all 0.2s;
        }

        .header-actions:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-menu button {
          width: 100%;
          padding: 0.75rem 1rem;
          text-align: left;
          border: none;
          background: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.2s;
        }

        .dropdown-menu button:hover {
          background: #f1f5f9;
        }

        .dropdown-menu button.danger {
          color: #dc2626;
        }

        .dropdown-menu button.danger:hover {
          background: #fef2f2;
        }

        .card-body {
          padding: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0;
          color: #475569;
          font-size: 0.85rem;
        }

        .info-row svg {
          color: #94a3b8;
          flex-shrink: 0;
        }

        .email-link {
          color: #0f6cbd;
          text-decoration: none;
          transition: color 0.2s;
        }

        .email-link:hover {
          color: #0a58a0;
          text-decoration: underline;
        }

        .card-footer {
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .badge-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .badge-status.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .badge-status.inactive {
          background: #ffebee;
          color: #c62828;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .btn-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          color: #0f6cbd;
          font-weight: 500;
          cursor: pointer;
          transition: gap 0.2s;
        }

        .btn-details:hover {
          gap: 0.75rem;
        }

        /* Empty State */
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
          margin-bottom: 1.5rem;
        }

        .btn-add-primary {
          padding: 0.75rem 1.5rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-add-primary:hover {
          background: #0a58a0;
        }

        /* Pagination */
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

        /* Loading */
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
          .teacher-module {
            padding: 1rem;
          }
          
          .module-header {
            padding: 1.5rem;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .teachers-grid {
            grid-template-columns: 1fr;
          }
          
          .search-filter-bar {
            flex-direction: column;
          }
          
          .search-form {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
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

export default TeacherList;