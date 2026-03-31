import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users, BookOpen, Calendar, CheckCircle, XCircle, Clock, Search, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { enrollmentService } from '../../api/enrollmentService';
import { studentService } from '../../api/studentService';
import { courseService } from '../../api/courseService';
import toast from 'react-hot-toast';

const EnrollmentList = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    studentId: '',
    courseId: '',
    status: ''
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [filters]);

  const fetchFiltersData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        studentService.getAll(),
        courseService.getAll({ active_only: false })
      ]);
      setStudents(studentsRes || []);
      setCourses(coursesRes || []);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.studentId) params.student_id = filters.studentId;
      if (filters.courseId) params.course_id = filters.courseId;
      const data = await enrollmentService.getAll(params.student_id, params.course_id);
      
      // Apply status filter client-side
      let filteredData = data || [];
      if (filters.status) {
        filteredData = filteredData.filter(e => e.status === filters.status);
      }
      setEnrollments(filteredData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load enrollments');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ studentId: '', courseId: '', status: '' });
    setShowFilters(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      try {
        await enrollmentService.delete(id);
        toast.success('Enrollment deleted successfully');
        fetchEnrollments();
      } catch (error) {
        console.error('Error deleting enrollment:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(enrollments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEnrollments = enrollments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    const statusMap = {
      'enrolled': { class: 'success', icon: '✓', label: 'Enrolled' },
      'pending': { class: 'warning', icon: '⏳', label: 'Pending' },
      'completed': { class: 'info', icon: '✓', label: 'Completed' },
      'dropped': { class: 'danger', icon: '✗', label: 'Dropped' },
      'failed': { class: 'danger', icon: '✗', label: 'Failed' }
    };
    const s = statusMap[status] || { class: 'secondary', icon: '•', label: status || 'Unknown' };
    return (
      <span className={`status-badge ${s.class}`}>
        <span className="status-icon">{s.icon}</span>
        {s.label}
      </span>
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

  // Calculate statistics
  const enrolledCount = enrollments.filter(e => e.status === 'enrolled').length;
  const pendingCount = enrollments.filter(e => e.status === 'pending').length;
  const completedCount = enrollments.filter(e => e.status === 'completed').length;

  if (loading && enrollments.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading enrollments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enrollment-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <Users size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Enrollment Management</h1>
            <p className="header-subtitle">Manage student course registrations and track enrollment status</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{enrollments.length}</h3>
            <p>Total Enrollments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{enrolledCount}</h3>
            <p>Active Enrollments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{pendingCount}</h3>
            <p>Pending Approval</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{completedCount}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="filter-actions">
          <button 
            className={`btn-filter ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
            {(filters.studentId || filters.courseId || filters.status) && (
              <span className="filter-badge">●</span>
            )}
          </button>
          <button
            className="btn-add"
            onClick={() => navigate('/enrollments/new')}
          >
            <Plus size={18} />
            <span>New Enrollment</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label>Student</label>
              <select
                name="studentId"
                className="filter-select"
                value={filters.studentId}
                onChange={handleFilterChange}
              >
                <option value="">All Students</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.student_name} ({student.student_id})
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Course</label>
              <select
                name="courseId"
                className="filter-select"
                value={filters.courseId}
                onChange={handleFilterChange}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.course_id || course.courseId} value={course.course_id || course.courseId}>
                    {course.course_name || course.courseName}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select
                name="status"
                className="filter-select"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="enrolled">Enrolled</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="filter-actions-group">
              <button className="btn-clear-filters" onClick={handleClearFilters}>
                <X size={16} />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Table */}
      {paginatedEnrollments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No enrollments found</h3>
          <p>Try adjusting your filters or create a new enrollment.</p>
          <button className="btn-add-primary" onClick={() => navigate('/enrollments/new')}>
            <Plus size={18} />
            <span>Create Enrollment</span>
          </button>
        </div>
      ) : (
        <>
          <div className="enrollments-table-container">
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Enrollment Date</th>
                  <th className="text-center">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {paginatedEnrollments.map(enrollment => (
                  <tr key={enrollment.enrollment_id || enrollment.enrollmentId}>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">
                          {(enrollment.student_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div className="student-details">
                          <span className="student-name">{enrollment.student_name}</span>
                          <span className="student-id">{enrollment.student_id_number || enrollment.studentIdNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="course-info">
                        <span className="course-name">{enrollment.course_name}</span>
                        <span className="course-code">{enrollment.course_code}</span>
                      </div>
                    </td>
                    <td>
                      <span className="semester-badge">{enrollment.semester || '-'}</span>
                    </td>
                    <td className="text-center">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="text-center">
                      {formatDate(enrollment.enrolled_date || enrollment.enrollmentRequestDate)}
                    </td>
                    <td className="text-center">
                      <div className="action-buttons">
                        <button
                          className="btn-icon edit"
                          onClick={() => navigate(`/enrollments/${enrollment.enrollment_id || enrollment.enrollmentId}/edit`)}
                          title="Edit Status"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={(e) => handleDelete(e, enrollment.enrollment_id || enrollment.enrollmentId)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
        .enrollment-module {
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

        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.yellow { background: #fff3e0; color: #ed6c02; }
        .stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }

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
          margin-bottom: 1.5rem;
        }

        .filter-actions {
          display: flex;
          justify-content: flex-end;
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
          position: relative;
        }

        .btn-filter.active {
          background: #0f6cbd;
          color: white;
          border-color: #0f6cbd;
        }

        .filter-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          font-size: 8px;
          color: #f59e0b;
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

        .filter-panel {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          border: 1px solid #e2e8f0;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 500;
          color: #334155;
          font-size: 0.85rem;
        }

        .filter-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.2s;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: #0f6cbd;
          box-shadow: 0 0 0 3px rgba(15, 108, 189, 0.1);
        }

        .filter-actions-group {
          display: flex;
          justify-content: flex-end;
        }

        .btn-clear-filters {
          padding: 0.75rem 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          color: #dc2626;
        }

        .btn-clear-filters:hover {
          background: #fef2f2;
          border-color: #dc2626;
        }

        .enrollments-table-container {
          background: white;
          border-radius: 20px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .enrollments-table {
          width: 100%;
          border-collapse: collapse;
        }

        .enrollments-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
        }

        .enrollments-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .enrollments-table tr:hover {
          background: #f8fafc;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .student-avatar {
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

        .student-details {
          display: flex;
          flex-direction: column;
        }

        .student-name {
          font-weight: 500;
          color: #1e293b;
        }

        .student-id {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .course-info {
          display: flex;
          flex-direction: column;
        }

        .course-name {
          font-weight: 500;
          color: #1e293b;
        }

        .course-code {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .semester-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #475569;
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

        .status-badge.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.warning {
          background: #fff3e0;
          color: #ed6c02;
        }

        .status-badge.info {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status-badge.danger {
          background: #ffebee;
          color: #c62828;
        }

        .status-badge.secondary {
          background: #e2e8f0;
          color: #475569;
        }

        .status-icon {
          font-size: 0.7rem;
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

        .btn-icon.edit {
          color: #0f6cbd;
        }

        .btn-icon.edit:hover {
          background: #e3f2fd;
        }

        .btn-icon.delete {
          color: #dc2626;
        }

        .btn-icon.delete:hover {
          background: #ffebee;
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
          .enrollment-module {
            padding: 1rem;
          }
          
          .module-header {
            padding: 1.5rem;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .filter-grid {
            grid-template-columns: 1fr;
          }
          
          .enrollments-table th, 
          .enrollments-table td {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EnrollmentList;