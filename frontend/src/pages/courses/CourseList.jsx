import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Info, PlayCircle, PauseCircle, FileText } from 'lucide-react';
import { courseService } from '../../api/courseService';
import toast from 'react-hot-toast';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search && search.trim() !== '') {
        params.search = search.trim();
      }
      if (activeOnly) {
        params.active_only = true;
      }
      
      const response = await courseService.getAll(params);
      setCourses(response || []);
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
  }, [search, activeOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
  };

  const handleActiveOnlyChange = (e) => {
    setActiveOnly(e.target.checked);
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

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await courseService.delete(courseId);
        toast.success(response?.message || 'Course deleted successfully');
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const handleExport = async (courseId, courseCode) => {
    try {
      const blob = await courseService.exportStudents(courseId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${courseCode}_students.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (error) {
      console.error('Error exporting course:', error);
      toast.error('Export failed');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString();
    } catch (e) {
      return '-';
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Course Management
            </h1>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <form onSubmit={handleSearch} className="row g-3">
                <div className="col-12">
                  <div className="d-flex gap-2">
                    <div className="flex-grow-1">
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          placeholder="Search by course name or code..."
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                      <i className="bi bi-search"></i>
                      <span>Search</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={handleClear} 
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    >
                      <i className="bi bi-arrow-repeat"></i>
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="activeOnly"
                      checked={activeOnly}
                      onChange={handleActiveOnlyChange}
                    />
                    <label className="form-check-label" htmlFor="activeOnly">
                      Show Active Only
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2 justify-content-md-end">
                <button
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={() => navigate('/courses/new')}
                >
                  <Plus size={16} />
                  <span>Add Course</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      {courses.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
            <span>No courses registered.</span>
            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/courses/new')}
              >
                <Plus size={16} className="me-2" />
                Add Your First Course
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="text-center" style={{ minWidth: '60px' }}>ID</th>
                    <th className="text-center" style={{ minWidth: '120px' }}>Course Code</th>
                    <th style={{ minWidth: '180px' }}>Course Name</th>
                    <th className="text-center" style={{ minWidth: '80px' }}>Credits</th>
                    <th style={{ minWidth: '150px' }}>Teacher</th>
                    <th className="text-center" style={{ minWidth: '100px' }}>Status</th>
                    <th className="text-center" style={{ minWidth: '140px' }}>Registered Date</th>
                    <th className="text-center" style={{ minWidth: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.course_id || course.courseId}>
                      <td className="text-center">{course.course_id || course.courseId}</td>
                      <td className="text-center">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill">
                          {course.course_code || course.courseCode}
                        </span>
                      </td>
                      <td>{course.course_name || course.courseName}</td>
                      <td className="text-center">
                        <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                          {course.credit_hours || course.creditHours} credits
                        </span>
                       </td>
                      <td>
                        {course.teacher_name || course.teacherName ? (
                          <span>{course.teacher_name || course.teacherName}</span>
                        ) : (
                          <span className="text-muted fst-italic">Unassigned</span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill px-3 ${course.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-center">{formatDate(course.created_at || course.createdAt)}</td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button
                            className="action-icon-link text-info"
                            onClick={() => navigate(`/courses/${course.course_id || course.courseId}`)}
                            title="Details"
                          >
                            <Info size={18} />
                          </button>
                          <button
                            className="action-icon-link text-primary"
                            onClick={() => navigate(`/courses/${course.course_id || course.courseId}/edit`)}
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="action-icon-link text-success"
                            onClick={() => handleExport(course.course_id || course.courseId, course.course_code || course.courseCode)}
                            title="Export Students"
                          >
                            <FileText size={18} />
                          </button>
                          {course.is_active ? (
                            <button
                              className="action-icon-link text-warning"
                              onClick={() => handleToggleActive(course.course_id || course.courseId, true)}
                              title="Deactivate"
                            >
                              <PauseCircle size={18} />
                            </button>
                          ) : (
                            <button
                              className="action-icon-link text-success"
                              onClick={() => handleToggleActive(course.course_id || course.courseId, false)}
                              title="Activate"
                            >
                              <PlayCircle size={18} />
                            </button>
                          )}
                          <button
                            className="action-icon-link text-danger"
                            onClick={() => handleDelete(course.course_id || course.courseId)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;