import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { resultService } from '../../api/resultService';
import { testService } from '../../api/testService';
import { courseService } from '../../api/courseService';
import toast from 'react-hot-toast';

const ResultList = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    testId: '',
    studentName: '',
    courseId: ''
  });

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [filters]);

  const fetchFiltersData = async () => {
    try {
      const [testsRes, coursesRes] = await Promise.all([
        testService.getAll(),
        courseService.getAll({ active_only: false })
      ]);
      setTests(testsRes || []);
      setCourses(coursesRes || []);
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.testId) params.testId = filters.testId;
      if (filters.studentName) params.studentName = filters.studentName;
      if (filters.courseId) params.courseId = filters.courseId;
      const response = await resultService.getAll(params);
      setResults(response || []);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load test results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ testId: '', studentName: '', courseId: '' });
  };

  const handleDelete = async (resultId) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await resultService.delete(resultId);
        toast.success('Result deleted successfully');
        fetchResults();
      } catch (error) {
        console.error('Error deleting result:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const getResultBadge = (result) => {
    if (result === '合格' || result === 'PASS') {
      return <span className="badge bg-success rounded-pill px-3">Pass</span>;
    }
    return <span className="badge bg-danger rounded-pill px-3">Fail</span>;
  };

  const getGradeBadge = (grade) => {
    const gradeMap = {
      'A+': 'bg-success',
      'A': 'bg-success',
      'B+': 'bg-info',
      'B': 'bg-info',
      'C+': 'bg-warning',
      'C': 'bg-warning',
      'D+': 'bg-secondary',
      'D': 'bg-secondary',
      'F': 'bg-danger'
    };
    const className = gradeMap[grade] || 'bg-secondary';
    return <span className={`badge ${className} rounded-pill px-3`}>{grade}</span>;
  };

  if (loading && results.length === 0) {
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
              Test Results
            </h1>
            <p className="text-muted mb-0">View and manage student examination scores</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Test</label>
              <select
                name="testId"
                className="form-select"
                value={filters.testId}
                onChange={handleFilterChange}
              >
                <option value="">All Tests</option>
                {tests.map(test => (
                  <option key={test.test_id || test.testId} value={test.test_id || test.testId}>
                    {test.test_name || test.testName} ({test.course_name || test.courseName})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Student Name</label>
              <input
                type="text"
                name="studentName"
                className="form-control"
                placeholder="Search by student name..."
                value={filters.studentName}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Course</label>
              <select
                name="courseId"
                className="form-select"
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
            <div className="col-12 text-end">
              <button className="btn btn-outline-secondary me-2" onClick={handleClearFilters}>
                <i className="bi bi-arrow-repeat me-2"></i>Clear
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/results/new')}>
                <Plus size={16} className="me-2" />
                Enter Result
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
            <span>No test results found.</span>
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
                    <th style={{ minWidth: '150px' }}>Test Name</th>
                    <th style={{ minWidth: '150px' }}>Student Name</th>
                    <th style={{ minWidth: '120px' }}>Course</th>
                    <th className="text-center" style={{ minWidth: '100px' }}>Score</th>
                    <th className="text-center" style={{ minWidth: '80px' }}>%</th>
                    <th className="text-center" style={{ minWidth: '80px' }}>Grade</th>
                    <th className="text-center" style={{ minWidth: '80px' }}>GPA</th>
                    <th className="text-center" style={{ minWidth: '80px' }}>Result</th>
                    <th className="text-center" style={{ minWidth: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.test_result_id || result.testResultId}>
                      <td className="text-center">{result.test_result_id || result.testResultId}</td>
                      <td>{result.test_name || result.testName}</td>
                      <td>{result.student_name || result.studentName}</td>
                      <td>{result.course_name || result.courseName}</td>
                      <td className="text-center">
                        {(result.score_obtained || result.scoreObtained)} / {(result.total_marks || result.totalMarks)}
                      </td>
                      <td className="text-center">
                        {result.percentage ? `${result.percentage.toFixed(1)}%` : '-'}
                      </td>
                      <td className="text-center">
                        {getGradeBadge(result.grade)}
                      </td>
                      <td className="text-center">{result.gpa || '-'}</td>
                      <td className="text-center">
                        {getResultBadge(result.result)}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button
                            className="action-icon-link text-primary"
                            onClick={() => navigate(`/results/${result.test_result_id || result.testResultId}/edit`)}
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="action-icon-link text-danger"
                            onClick={() => handleDelete(result.test_result_id || result.testResultId)}
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

export default ResultList;