import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Search, X, Filter, ChevronLeft, ChevronRight, Award, BookOpen, User, BarChart, TrendingUp, TrendingDown } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    testId: '',
    studentName: '',
    courseId: ''
  });
  const itemsPerPage = 10;

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
      setCurrentPage(1);
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
    setShowFilters(false);
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

  // Pagination
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

  const getResultBadge = (result) => {
    if (result === '合格' || result === 'PASS' || result === 'Pass') {
      return (
        <span className="badge-status success">
          <span className="status-icon">✓</span>
          Pass
        </span>
      );
    }
    return (
      <span className="badge-status danger">
        <span className="status-icon">✗</span>
        Fail
      </span>
    );
  };

  const getGradeBadge = (grade) => {
    const gradeMap = {
      'A+': { class: 'grade-aplus', label: 'A+' },
      'A': { class: 'grade-a', label: 'A' },
      'B+': { class: 'grade-bplus', label: 'B+' },
      'B': { class: 'grade-b', label: 'B' },
      'C+': { class: 'grade-cplus', label: 'C+' },
      'C': { class: 'grade-c', label: 'C' },
      'D+': { class: 'grade-dplus', label: 'D+' },
      'D': { class: 'grade-d', label: 'D' },
      'F': { class: 'grade-f', label: 'F' }
    };
    const gradeInfo = gradeMap[grade] || { class: 'grade-default', label: grade || '-' };
    return <span className={`grade-badge ${gradeInfo.class}`}>{gradeInfo.label}</span>;
  };

  const getScorePercentage = (score, total) => {
    if (!score || !total) return 0;
    return ((score / total) * 100).toFixed(1);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#2e7d32';
    if (percentage >= 60) return '#ed6c02';
    if (percentage >= 40) return '#ed6c02';
    return '#c62828';
  };

  // Calculate statistics
  const passedCount = results.filter(r => r.result === '合格' || r.result === 'PASS' || r.result === 'Pass').length;
  const passRate = results.length > 0 ? ((passedCount / results.length) * 100).toFixed(1) : 0;
  const averageScore = results.length > 0 
    ? (results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length).toFixed(1) 
    : 0;

  if (loading && results.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading test results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <Award size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Test Results</h1>
            <p className="header-subtitle">View and manage student examination scores and performance</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <BarChart size={24} />
          </div>
          <div className="stat-info">
            <h3>{results.length}</h3>
            <p>Total Results</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{passedCount}</h3>
            <p>Passed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <h3>{results.length - passedCount}</h3>
            <p>Failed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>{passRate}%</h3>
            <p>Pass Rate</p>
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
            {(filters.testId || filters.studentName || filters.courseId) && (
              <span className="filter-badge">●</span>
            )}
          </button>
          <button
            className="btn-add"
            onClick={() => navigate('/results/new')}
          >
            <Plus size={18} />
            <span>Enter Result</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-grid">
            <div className="filter-group">
              <label>Test</label>
              <select
                name="testId"
                className="filter-select"
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
            <div className="filter-group">
              <label>Student Name</label>
              <div className="filter-input-wrapper">
                <User size={16} className="filter-icon" />
                <input
                  type="text"
                  name="studentName"
                  className="filter-input"
                  placeholder="Search by student name..."
                  value={filters.studentName}
                  onChange={handleFilterChange}
                />
              </div>
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
            <div className="filter-actions-group">
              <button className="btn-clear-filters" onClick={handleClearFilters}>
                <X size={16} />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {paginatedResults.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No test results found</h3>
          <p>Try adjusting your filters or enter new test results.</p>
          <button className="btn-add-primary" onClick={() => navigate('/results/new')}>
            <Plus size={18} />
            <span>Enter First Result</span>
          </button>
        </div>
      ) : (
        <>
          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Test</th>
                  <th>Course</th>
                  <th className="text-center">Score</th>
                  <th className="text-center">%</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">GPA</th>
                  <th className="text-center">Result</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map(result => {
                  const percentage = result.percentage || getScorePercentage(
                    result.score_obtained || result.scoreObtained,
                    result.total_marks || result.totalMarks
                  );
                  return (
                    <tr key={result.test_result_id || result.testResultId}>
                      <td>
                        <div className="student-info">
                          <div className="student-avatar">
                            {(result.student_name || result.studentName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div className="student-details">
                            <span className="student-name">{result.student_name || result.studentName}</span>
                            <span className="student-id">{result.student_id || result.studentId}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="test-info">
                          <span className="test-name">{result.test_name || result.testName}</span>
                          <span className="test-date">
                            {result.test_date ? new Date(result.test_date).toLocaleDateString() : '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="course-badge">
                          {result.course_name || result.courseName}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="score-value">
                          {(result.score_obtained || result.scoreObtained)} / {(result.total_marks || result.totalMarks)}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getScoreColor(percentage)
                            }}
                          />
                          <span className="percentage-text">{percentage}%</span>
                        </div>
                      </td>
                      <td className="text-center">
                        {getGradeBadge(result.grade)}
                      </td>
                      <td className="text-center">
                        <span className="gpa-value">{result.gpa || '-'}</span>
                      </td>
                      <td className="text-center">
                        {getResultBadge(result.result)}
                      </td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="btn-icon edit"
                            onClick={() => navigate(`/results/${result.test_result_id || result.testResultId}/edit`)}
                            title="Edit Result"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDelete(result.test_result_id || result.testResultId)}
                            title="Delete Result"
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
        .result-module {
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
        .stat-icon.red { background: #ffebee; color: #c62828; }
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
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

        .filter-input-wrapper {
          position: relative;
        }

        .filter-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .filter-input, .filter-select {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .filter-select {
          padding: 0.75rem 2rem 0.75rem 1rem;
          background: white;
          cursor: pointer;
        }

        .filter-input:focus, .filter-select:focus {
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

        .results-table-container {
          background: white;
          border-radius: 20px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
        }

        .results-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
        }

        .results-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .results-table tr:hover {
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

        .test-info {
          display: flex;
          flex-direction: column;
        }

        .test-name {
          font-weight: 500;
          color: #1e293b;
        }

        .test-date {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .course-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #475569;
        }

        .score-value {
          font-weight: 600;
          color: #1e293b;
        }

        .percentage-bar {
          position: relative;
          width: 80px;
          height: 28px;
          background: #f1f5f9;
          border-radius: 20px;
          overflow: hidden;
          margin: 0 auto;
        }

        .percentage-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          border-radius: 20px;
          transition: width 0.3s;
        }

        .percentage-text {
          position: relative;
          z-index: 1;
          font-size: 0.7rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #1e293b;
        }

        .grade-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .grade-aplus { background: #e8f5e9; color: #2e7d32; }
        .grade-a { background: #e8f5e9; color: #2e7d32; }
        .grade-bplus { background: #e3f2fd; color: #1976d2; }
        .grade-b { background: #e3f2fd; color: #1976d2; }
        .grade-cplus { background: #fff3e0; color: #ed6c02; }
        .grade-c { background: #fff3e0; color: #ed6c02; }
        .grade-dplus { background: #f3e5f5; color: #7b1fa2; }
        .grade-d { background: #f3e5f5; color: #7b1fa2; }
        .grade-f { background: #ffebee; color: #c62828; }
        .grade-default { background: #e2e8f0; color: #475569; }

        .gpa-value {
          font-weight: 600;
          color: #1e293b;
        }

        .badge-status {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .badge-status.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .badge-status.danger {
          background: #ffebee;
          color: #c62828;
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

        .text-center {
          text-align: center;
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
          .result-module {
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
          
          .results-table th, .results-table td {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultList;