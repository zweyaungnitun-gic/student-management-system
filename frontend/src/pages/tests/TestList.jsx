import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Info, FileText, Search, X, Filter, ChevronLeft, ChevronRight, Calendar, BookOpen, Award, Clock, MoreVertical, Eye } from 'lucide-react';
import { testService } from '../../api/testService';
import { courseService } from '../../api/courseService';
import toast from 'react-hot-toast';

const TestList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchTests();
  }, [search, selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAll({ active_only: true });
      setCourses(response || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCourseId) params.course_id = selectedCourseId;
      const response = await testService.getAll(params);
      setTests(response || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load tests');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
    setSelectedCourseId('');
  };

  const handleDelete = async (testId, testName) => {
    if (window.confirm(`Are you sure you want to delete "${testName}"? All associated results will also be deleted.`)) {
      try {
        await testService.delete(testId);
        toast.success(`Test "${testName}" deleted successfully`);
        fetchTests();
      } catch (error) {
        console.error('Error deleting test:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
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

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  const getRandomColor = (id) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#30cfd0', '#a8edea', '#fed6e3'];
    return colors[id % colors.length];
  };

  // Pagination
  const totalPages = Math.ceil(tests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTests = tests.slice(startIndex, startIndex + itemsPerPage);

  if (loading && tests.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <FileText size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Test Management</h1>
            <p className="header-subtitle">Manage examinations, assessments, and student performance tracking</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon bg-primary-light">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>{tests.length}</h3>
            <p>Total Tests</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-success-light">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Active Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-warning-light">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{tests.filter(t => new Date(t.test_date || t.testDate) > new Date()).length}</h3>
            <p>Upcoming Tests</p>
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
              placeholder="Search by test name or course..."
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
            onClick={() => navigate('/tests/new')}
          >
            <Plus size={18} />
            <span>Create Test</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Course</label>
            <select
              className="filter-select"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.course_id || course.courseId} value={course.course_id || course.courseId}>
                  {course.course_name || course.courseName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tests Grid */}
      {paginatedTests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No tests found</h3>
          <p>Try adjusting your search or filters, or create a new test.</p>
          <button className="btn-add-primary" onClick={() => navigate('/tests/new')}>
            <Plus size={18} />
            <span>Create Your First Test</span>
          </button>
        </div>
      ) : (
        <>
          <div className="tests-grid">
            {paginatedTests.map(test => (
              <div key={test.test_id || test.testId} className="test-card">
                <div className="card-header">
                  <div className="test-icon" style={{ background: getRandomColor(test.test_id || test.testId) }}>
                    <FileText size={24} />
                  </div>
                  <div className="header-info">
                    <h3 className="test-name">{test.test_name || test.testName}</h3>
                    <span className="course-badge">
                      <BookOpen size={12} />
                      {test.course_name || test.courseName}
                    </span>
                  </div>
                  <div className="header-actions">
                    <div className="dropdown">
                      <button className="dropdown-trigger">
                        <MoreVertical size={18} />
                      </button>
                      <div className="dropdown-menu">
                        <button onClick={() => navigate(`/tests/${test.test_id || test.testId}`)}>
                          <Eye size={16} />
                          View Details
                        </button>
                        <button onClick={() => navigate(`/tests/${test.test_id || test.testId}/edit`)}>
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button onClick={() => navigate(`/results/add?testId=${test.test_id || test.testId}`)}>
                          <FileText size={16} />
                          Add Results
                        </button>
                        <button className="danger" onClick={() => handleDelete(test.test_id || test.testId, test.test_name || test.testName)}>
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-body">
                  {test.description && (
                    <p className="test-description">{test.description}</p>
                  )}
                  <div className="test-marks">
                    <div className="mark-item total">
                      <Award size={14} />
                      <span>Total: {test.total_marks || test.totalMarks}</span>
                    </div>
                    <div className="mark-item passing">
                      <CheckCircle size={14} />
                      <span>Passing: {test.passing_marks || test.passingMarks}</span>
                    </div>
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="test-meta">
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{formatDate(test.test_date || test.testDate)}</span>
                    </div>
                    {test.duration_minutes && (
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{test.duration_minutes} min</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn-details"
                    onClick={() => navigate(`/tests/${test.test_id || test.testId}`)}
                  >
                    View Details
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
        .test-module {
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

        .filter-select {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          min-width: 200px;
        }

        /* Tests Grid */
        .tests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .test-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .test-card:hover {
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

        .test-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .header-info {
          flex: 1;
        }

        .test-name {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #0f172a;
        }

        .course-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
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

        .test-description {
          font-size: 0.85rem;
          color: #475569;
          margin: 0 0 1rem 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .test-marks {
          display: flex;
          gap: 1rem;
        }

        .mark-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
        }

        .mark-item.total {
          background: #e3f2fd;
          color: #1976d2;
        }

        .mark-item.passing {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .card-footer {
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .test-meta {
          display: flex;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: #64748b;
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
          .test-module {
            padding: 1rem;
          }
          
          .module-header {
            padding: 1.5rem;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .tests-grid {
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

export default TestList;