import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, PlayCircle, PauseCircle, Download, ChevronLeft, ChevronRight, BookOpen, Search, X, Users, Award } from 'lucide-react';
import { courseService } from '../../api/courseService';
import toast from 'react-hot-toast';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const itemsPerPage = 10;

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      if (filterStatus === 'active') {
        params.active_only = true;
      }
      
      const response = await courseService.getAll(params);
      let data = response || [];
      
      // Apply status filter if not using active_only
      if (filterStatus === 'inactive') {
        data = data.filter(course => !course.is_active);
      } else if (filterStatus === 'active' && !params.active_only) {
        data = data.filter(course => course.is_active);
      }
      
      setCourses(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, filterStatus]);

  const handleViewDetails = (courseId) => {
    navigate(`/courses/${courseId}`);  
  };

  const handleToggleActive = async (courseId, isActive) => {
    try {
      if (isActive) {
        await courseService.deactivate(courseId);
        toast.success('Course deactivated');
      } else {
        await courseService.activate(courseId);
        toast.success('Course activated');
      }
      fetchCourses();
    } catch (error) {
      console.error('Error toggling course status:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (e, courseId, courseName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      try {
        await courseService.delete(courseId);
        toast.success(`Course "${courseName}" deleted successfully`);
        fetchCourses();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(filteredCourses.map(c => c.course_id || c.courseId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      const newSelected = selectedIds.filter(i => i !== id);
      setSelectedIds(newSelected);
      setSelectAll(newSelected.length === filteredCourses.length && filteredCourses.length > 0);
    } else {
      const newSelected = [...selectedIds, id];
      setSelectedIds(newSelected);
      setSelectAll(newSelected.length === filteredCourses.length);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No courses selected');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected course(s)?`)) {
      try {
        let successCount = 0;
        let failCount = 0;
        
        for (const id of selectedIds) {
          try {
            await courseService.delete(id);
            successCount++;
          } catch {
            failCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} course(s) deleted successfully`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} course(s) failed to delete`);
        }
        
        fetchCourses();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        toast.error('Bulk delete failed');
      }
    }
  };

  const handleBulkStatusUpdate = async (activate) => {
    if (selectedIds.length === 0) {
      toast.error('No courses selected');
      return;
    }
    
    const action = activate ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} ${selectedIds.length} selected course(s)?`)) {
      try {
        let successCount = 0;
        let failCount = 0;
        
        for (const id of selectedIds) {
          try {
            if (activate) {
              await courseService.activate(id);
            } else {
              await courseService.deactivate(id);
            }
            successCount++;
          } catch {
            failCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} course(s) ${action}d successfully`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} course(s) failed to ${action}`);
        }
        
        fetchCourses();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        toast.error(`Bulk ${action} failed`);
      }
    }
  };

  const handleDownloadCSV = () => {
    try {
      const headers = [
        'Course ID',
        'Course Code',
        'Course Name',
        'Credit Hours',
        'Teacher',
        'Status',
        'Created Date'
      ];

      const selectedCourses = courses.filter(c => selectedIds.includes(c.course_id || c.courseId));
      const coursesToExport = selectedIds.length > 0 ? selectedCourses : courses;
      
      if (coursesToExport.length === 0) {
        toast.error('No courses to export');
        return;
      }

      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const course of coursesToExport) {
        const row = [
          `"${course.course_id || course.courseId || ''}"`,
          `"${course.course_code || course.courseCode || ''}"`,
          `"${(course.course_name || course.courseName || '').replace(/"/g, '""')}"`,
          `"${course.credit_hours || course.creditHours || ''}"`,
          `"${course.teacher_name || course.teacherName || 'Unassigned'}"`,
          `"${course.is_active ? 'Active' : 'Inactive'}"`,
          `"${course.created_at || course.createdAt || ''}"`
        ];
        csvRows.push(row.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `courses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${coursesToExport.length} course(s)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export courses');
    }
  };

  const filteredCourses = courses.filter(c => 
    (c.course_name || c.courseName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.course_code || c.courseCode)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <span className="status-badge success"><span className="status-dot"></span>Active</span>;
    }
    return <span className="status-badge danger"><span className="status-dot"></span>Inactive</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '-';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activeCourses = courses.filter(c => c.is_active).length;
  const totalCredits = courses.reduce((sum, c) => sum + (c.credit_hours || c.creditHours || 0), 0);

  if (loading && courses.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-list-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <BookOpen size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Course Management</h1>
            <p className="header-subtitle">Manage academic courses, curriculum, and student enrollments</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Total Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <PlayCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{activeCourses}</h3>
            <p>Active Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <PauseCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{courses.length - activeCourses}</h3>
            <p>Inactive Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalCredits}</h3>
            <p>Total Credits</p>
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="stat-card selected">
            <div className="stat-icon purple">
              <span>{selectedIds.length}</span>
            </div>
            <div className="stat-info">
              <h3>Selected</h3>
              <p>{selectedIds.length} course(s)</p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Action Bar */}
      <div className="action-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by course name or code..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="action-buttons">
          {/* Status Filter Dropdown */}
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Courses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          
          {selectedIds.length > 0 && (
            <>
              <button className="btn-bulk-active" onClick={() => handleBulkStatusUpdate(true)}>
                <PlayCircle size={16} />
                <span>Activate ({selectedIds.length})</span>
              </button>
              <button className="btn-bulk-inactive" onClick={() => handleBulkStatusUpdate(false)}>
                <PauseCircle size={16} />
                <span>Deactivate ({selectedIds.length})</span>
              </button>
              <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                <Trash2 size={16} />
                <span>Delete ({selectedIds.length})</span>
              </button>
              <button className="btn-download" onClick={handleDownloadCSV}>
                <Download size={16} />
                <span>Download Selected</span>
              </button>
            </>
          )}
          <button className="btn-download-all" onClick={() => handleDownloadCSV()}>
            <Download size={16} />
            <span>Download All</span>
          </button>
          <button className="btn-add" onClick={() => navigate('/courses/new')}>
            <Plus size={16} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Courses Table */}
      {paginatedCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No courses found</h3>
          <p>Try adjusting your search or filters, or add a new course.</p>
          <button className="btn-add-primary" onClick={() => navigate('/courses/new')}>
            <Plus size={18} />
            <span>Add Your First Course</span>
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="courses-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredCourses.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Course ID</th>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Teacher</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Created Date</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.map(course => {
                  const courseId = course.course_id || course.courseId;
                  const courseCode = course.course_code || course.courseCode;
                  const courseName = course.course_name || course.courseName;
                  const creditHours = course.credit_hours || course.creditHours;
                  const teacherName = course.teacher_name || course.teacherName;
                  const isActive = course.is_active;
                  
                  return (
                    <tr key={courseId}>
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(courseId)}
                          onChange={(e) => handleSelectRow(e, courseId)}
                        />
                      </td>
                      <td className="course-id-cell">
                        <span className="course-id-badge">
                          {courseId}
                        </span>
                      </td>
                      <td className="course-code-cell">
                        <span className="course-code-badge">
                          {courseCode}
                        </span>
                      </td>
                      <td className="course-name-cell">
                        <div className="course-name-info">
                          <div className="course-avatar">
                            {getInitials(courseName)}
                          </div>
                          <span>{courseName}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="credit-badge">
                          {creditHours || '-'}
                        </span>
                      </td>
                      <td>
                        {teacherName ? (
                          <span className="teacher-name">{teacherName}</span>
                        ) : (
                          <span className="teacher-unassigned">Unassigned</span>
                        )}
                      </td>
                      <td className="text-center">
                        {getStatusBadge(isActive)}
                      </td>
                      <td className="text-center">{formatDate(course.created_at || course.createdAt)}</td>
                      <td className="actions-col">
                        <div className="action-icons">
                          <button
                            className="icon-btn view"
                            onClick={() => handleViewDetails(courseId)}  
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="icon-btn edit"
                            onClick={() => navigate(`/courses/${courseId}/edit`)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          {isActive ? (
                            <button
                              className="icon-btn deactivate"
                              onClick={() => handleToggleActive(courseId, true)}
                              title="Deactivate"
                            >
                              <PauseCircle size={16} />
                            </button>
                          ) : (
                            <button
                              className="icon-btn activate"
                              onClick={() => handleToggleActive(courseId, false)}
                              title="Activate"
                            >
                              <PlayCircle size={16} />
                            </button>
                          )}
                          <button
                            className="icon-btn delete"
                            onClick={(e) => handleDelete(e, courseId, courseName)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              <div className="page-info">
                Page {currentPage} of {totalPages}
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
          
          <div className="table-footer">
            <span className="showing-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
            </span>
            <span className="selected-info">
              {selectedIds.length} course(s) selected
            </span>
          </div>
        </>
      )}

      <style>{`
        .course-list-module {
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
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          flex: 1;
          min-width: 150px;
        }

        .stat-card.selected {
          background: #e3f2fd;
          border: 1px solid #0f6cbd;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.orange { background: #fff3e0; color: #ed6c02; }
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

        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-wrapper {
          flex: 1;
          max-width: 350px;
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
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-select {
          padding: 0.6rem 2rem 0.6rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
        }

        .btn-add, .btn-download, .btn-download-all, .btn-bulk-delete, .btn-bulk-active, .btn-bulk-inactive {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-add {
          background: #10b981;
          color: white;
        }

        .btn-add:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .btn-download, .btn-download-all {
          background: white;
          border: 1px solid #0f6cbd;
          color: #0f6cbd;
        }

        .btn-download:hover, .btn-download-all:hover {
          background: #e3f2fd;
        }

        .btn-bulk-active {
          background: #10b981;
          color: white;
        }

        .btn-bulk-active:hover {
          background: #059669;
        }

        .btn-bulk-inactive {
          background: #f59e0b;
          color: white;
        }

        .btn-bulk-inactive:hover {
          background: #d97706;
        }

        .btn-bulk-delete {
          background: #dc2626;
          color: white;
        }

        .btn-bulk-delete:hover {
          background: #b91c1c;
        }

        .table-container {
          background: white;
          border-radius: 20px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .courses-table {
          width: 100%;
          border-collapse: collapse;
        }

        .courses-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
        }

        .courses-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .courses-table tr:hover {
          background: #f8fafc;
        }

        .checkbox-col {
          width: 40px;
          text-align: center;
        }

        .checkbox-col input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .course-id-cell .course-id-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border-radius: 6px;
          font-size: 0.75rem;
          font-family: monospace;
          color: #475569;
        }

        .course-code-cell .course-code-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e3f2fd;
          border-radius: 20px;
          font-size: 0.75rem;
          font-family: monospace;
          color: #1976d2;
          font-weight: 500;
        }

        .course-name-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .course-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .credit-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #475569;
        }

        .teacher-name {
          font-size: 0.85rem;
          color: #334155;
        }

        .teacher-unassigned {
          font-size: 0.75rem;
          color: #f59e0b;
          font-style: italic;
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

        .status-badge.danger {
          background: #ffebee;
          color: #c62828;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .actions-col {
          width: 140px;
          text-align: center;
        }

        .action-icons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .icon-btn {
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .icon-btn.view { color: #0f6cbd; }
        .icon-btn.view:hover { background: #e3f2fd; }
        .icon-btn.edit { color: #f59e0b; }
        .icon-btn.edit:hover { background: #fef3c7; }
        .icon-btn.activate { color: #10b981; }
        .icon-btn.activate:hover { background: #d1fae5; }
        .icon-btn.deactivate { color: #f59e0b; }
        .icon-btn.deactivate:hover { background: #fef3c7; }
        .icon-btn.delete { color: #dc2626; }
        .icon-btn.delete:hover { background: #fee2e2; }

        .text-center {
          text-align: center;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .page-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 10px;
          cursor: pointer;
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

        .page-info {
          font-size: 0.85rem;
          color: #64748b;
        }

        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding: 0.5rem 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .showing-info, .selected-info {
          background: #f8fafc;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
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
          .course-list-module {
            padding: 1rem;
          }
          
          .module-header {
            padding: 1.5rem;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .action-bar {
            flex-direction: column;
          }
          
          .search-wrapper {
            max-width: 100%;
          }
          
          .action-buttons {
            width: 100%;
            justify-content: stretch;
          }
          
          .action-buttons button,
          .action-buttons select {
            flex: 1;
            justify-content: center;
          }
          
          .table-footer {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseList;