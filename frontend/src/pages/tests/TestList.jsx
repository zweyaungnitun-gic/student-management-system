import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Info, FileText } from 'lucide-react';
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

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test? All associated results will also be deleted.')) {
      try {
        await testService.delete(testId);
        toast.success('Test deleted successfully');
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
      return date.toLocaleDateString();
    } catch (e) {
      return '-';
    }
  };

  if (loading && tests.length === 0) {
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
              Test Management
            </h1>
            <p className="text-muted mb-0 small">Manage examinations and assessments</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <form onSubmit={handleSearch} className="row g-3">
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search by test name or course name..."
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
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
                <div className="col-md-2 d-flex gap-2">
                  <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                    <i className="bi bi-search"></i>
                    <span>Search</span>
                  </button>
                  <button type="button" onClick={handleClear} className="btn btn-outline-secondary d-flex align-items-center gap-2">
                    <i className="bi bi-arrow-repeat"></i>
                    <span>Refresh</span>
                  </button>
                </div>
              </form>
            </div>
            <div className="col-md-4">
              <div className="d-flex gap-2 justify-content-md-end">
                <button
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={() => navigate('/tests/new')}
                >
                  <Plus size={16} />
                  <span>Create Test</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      {tests.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
            <span>No tests registered.</span>
            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/tests/new')}
              >
                <Plus size={16} className="me-2" />
                Create Your First Test
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
                    <th style={{ minWidth: '180px' }}>Test Name</th>
                    <th style={{ minWidth: '150px' }}>Course</th>
                    <th className="text-center" style={{ minWidth: '80px' }}>Total Marks</th>
                    <th className="text-center" style={{ minWidth: '80px' }}>Passing Marks</th>
                    <th className="text-center" style={{ minWidth: '120px' }}>Test Date</th>
                    <th style={{ minWidth: '120px' }}>Created By</th>
                    <th className="text-center" style={{ minWidth: '180px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map(test => (
                    <tr key={test.test_id || test.testId}>
                      <td className="text-center">{test.test_id || test.testId}</td>
                      <td>{test.test_name || test.testName}</td>
                      <td>
                        <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                          <i className="bi bi-book me-1"></i>
                          {test.course_name || test.courseName}
                        </span>
                      </td>
                      <td className="text-center">{test.total_marks || test.totalMarks}</td>
                      <td className="text-center">{test.passing_marks || test.passingMarks || '-'}</td>
                      <td className="text-center">{formatDate(test.test_date || test.testDate)}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                          <i className="bi bi-person me-1"></i>
                          {test.created_by_name || test.createdByName || 'System'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button
                            className="action-icon-link text-info"
                            onClick={() => navigate(`/tests/${test.test_id || test.testId}`)}
                            title="Details"
                          >
                            <Info size={18} />
                          </button>
                          <button
                            className="action-icon-link text-primary"
                            onClick={() => navigate(`/tests/${test.test_id || test.testId}/edit`)}
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="action-icon-link text-success"
                            onClick={() => navigate(`/results/add?testId=${test.test_id || test.testId}`)}
                            title="Add Results"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            className="action-icon-link text-danger"
                            onClick={() => handleDelete(test.test_id || test.testId)}
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

export default TestList;