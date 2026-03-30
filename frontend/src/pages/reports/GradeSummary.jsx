import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText, BookOpen, Award, CheckCircle, XCircle } from 'lucide-react';
import { reportService } from '../../api/reportService';
import toast from 'react-hot-toast';

const GradeSummary = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [gradeSummary, setGradeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('Semester 1');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (studentId) {
      fetchGradeSummary();
    }
  }, [studentId, academicYear, semester, currentPage]);

  const fetchGradeSummary = async () => {
    try {
      setLoading(true);
      const response = await reportService.getStudentGradeSummary(
        studentId, academicYear, semester, currentPage, pageSize
      );
      setGradeSummary(response);
      setTotalPages(response.totalPages || 1);
      setTotalResults(response.totalResults || (response.testResults?.length || 0));
    } catch (error) {
      console.error('Error fetching grade summary:', error);
      toast.error('Failed to load grade summary');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const getResultBadge = (result) => {
    if (result === '合格' || result === 'Pass') {
      return <span className="badge bg-success rounded-pill px-3">Pass</span>;
    }
    return <span className="badge bg-danger rounded-pill px-3">Fail</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!gradeSummary) {
    return (
      <div className="text-center py-5">
        <p>No grade data found for this student.</p>
        <button className="btn btn-primary" onClick={() => navigate('/reports')}>
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={() => navigate('/reports')}
          >
            <ChevronLeft size={18} />
            <span>Back to Reports</span>
          </button>
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Grade Summary
            </h1>
            <p className="text-muted mb-0">
              {gradeSummary.student_name || gradeSummary.studentName} ({gradeSummary.student_id_number || gradeSummary.studentIdNumber})
            </p>
          </div>
        </div>
      </div>

      {/* Academic Year and Semester Selectors */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Academic Year</label>
              <select
                className="form-select"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Semester</label>
              <select
                className="form-select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="Semester 1">First Semester</option>
                <option value="Semester 2">Second Semester</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={fetchGradeSummary}>
                <i className="bi bi-arrow-repeat me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-primary bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <Award size={28} className="text-primary" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Overall GPA</h6>
                  <h3 className="mb-0 fw-bold">{gradeSummary.overall_gpa || gradeSummary.overallGPA || '0.00'}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-success bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <Award size={28} className="text-success" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Overall Grade</h6>
                  <h3 className="mb-0 fw-bold">{gradeSummary.overall_grade || gradeSummary.overallGrade || 'N/A'}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-info bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <CheckCircle size={28} className="text-info" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Pass/Fail</h6>
                  <h3 className="mb-0 fw-bold">
                    {gradeSummary.passed_tests || gradeSummary.passedTests} / {gradeSummary.failed_tests || gradeSummary.failedTests}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 bg-warning bg-opacity-10">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <BookOpen size={28} className="text-warning" />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Tests</h6>
                  <h3 className="mb-0 fw-bold">{gradeSummary.total_tests || gradeSummary.totalTests || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course-wise GPA */}
      {gradeSummary.gpa_by_course && Object.keys(gradeSummary.gpa_by_course).length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="bi bi-book me-2 text-primary"></i>
              Grades by Course
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Course</th>
                    <th className="text-center">GPA</th>
                    <th className="text-center">Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(gradeSummary.gpa_by_course).map(([course, gpa]) => (
                    <tr key={course}>
                      <td className="ps-4">{course}</td>
                      <td className="text-center">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                          {gpa}
                        </span>
                      </td>
                      <td className="text-center">
                        {getGradeBadge(gradeSummary.grade_by_course?.[course])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Test Results Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-list-check me-2 text-success"></i>
            Test Result Details
          </h5>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => navigate(`/reports/report-card/${studentId}`)}
          >
            <i className="bi bi-file-text me-2"></i>
            View Report Card
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Test Name</th>
                  <th className="text-center">Score / Full Marks</th>
                  <th className="text-center">Percentage</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">GPA</th>
                  <th className="text-center">Result</th>
                </tr>
              </thead>
              <tbody>
                {(gradeSummary.test_results || gradeSummary.testResults || []).map((result, idx) => (
                  <tr key={result.test_result_id || result.testResultId || idx}>
                    <td className="ps-4">{result.test_name || result.testName}</td>
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
                  </tr>
                ))}
                {(gradeSummary.test_results || gradeSummary.testResults || []).length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      No test results available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &laquo; Previous
                    </button>
                  </li>
                  {[...Array(totalPages).keys()].map(page => (
                    <li key={page + 1} className={`page-item ${currentPage === page + 1 ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Results count info */}
          <div className="text-center text-muted small mt-2 mb-3">
            Showing {gradeSummary.test_results?.length || 0} of {totalResults} results
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(`/students/${studentId}`)}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Student Details
        </button>
      </div>
    </div>
  );
};

export default GradeSummary;