import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Trophy, Award, TrendingUp } from 'lucide-react';
import { reportService } from '../../api/reportService';
import toast from 'react-hot-toast';

const ClassRankings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState(searchParams.get('className') || 'N5');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('Semester 1');

  useEffect(() => {
    fetchRankings();
  }, [className, academicYear, semester]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await reportService.getClassRankings(className, academicYear, semester);
      setRankings(response);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      toast.error('Failed to load class rankings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRankings();
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return <span className="badge bg-warning text-dark rounded-pill px-3 py-2">🥇 1st</span>;
    } else if (rank === 2) {
      return <span className="badge bg-secondary rounded-pill px-3 py-2">🥈 2nd</span>;
    } else if (rank === 3) {
      return <span className="badge bg-info rounded-pill px-3 py-2">🥉 3rd</span>;
    }
    return <span className="badge bg-light text-dark rounded-pill px-3 py-2">{rank}th</span>;
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

  if (loading) {
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
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => navigate('/reports')}
          >
            <ChevronLeft size={18} />
            <span>Back to Reports</span>
          </button>
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Class Rankings
            </h1>
            <p className="text-muted mb-0">
              {rankings?.class_name || rankings?.className} - {rankings?.academic_year || rankings?.academicYear} {rankings?.semester}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Form */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Select Class</label>
              <select
                className="form-select"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              >
                <option value="N5">N5 Class</option>
                <option value="N4">N4 Class</option>
                <option value="N3">N3 Class</option>
                <option value="N2">N2 Class</option>
                <option value="N1">N1 Class</option>
              </select>
            </div>
            <div className="col-md-3">
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
            <div className="col-md-3">
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
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-search me-2"></i>Show
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Statistics Cards */}
      {rankings && rankings.total_students > 0 && (
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 bg-primary bg-opacity-10">
              <div className="card-body text-center">
                <h6 className="text-muted mb-1">Total Students</h6>
                <h3 className="mb-0 fw-bold">{rankings.total_students || rankings.totalStudents}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 bg-success bg-opacity-10">
              <div className="card-body text-center">
                <h6 className="text-muted mb-1">Average GPA</h6>
                <h3 className="mb-0 fw-bold">{rankings.average_gpa || rankings.averageGpa}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 bg-info bg-opacity-10">
              <div className="card-body text-center">
                <h6 className="text-muted mb-1">GPA Range</h6>
                <h3 className="mb-0 fw-bold">
                  {(rankings.highest_gpa || rankings.highestGpa)} - {(rankings.lowest_gpa || rankings.lowestGpa)}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {(!rankings || rankings.total_students === 0) && (
        <div className="alert alert-info text-center">
          <i className="bi bi-info-circle me-2"></i>
          No data to display. Please select a class or register student data.
        </div>
      )}

      {/* Rankings Table */}
      {rankings && rankings.total_students > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-white py-3">
            <h5 className="card-title mb-0">
              <i className="bi bi-trophy me-2 text-warning"></i>
              Class Rankings
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="text-center" style={{ width: '80px' }}>Rank</th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th className="text-center">Total Tests</th>
                    <th className="text-center">Pass/Fail</th>
                    <th className="text-center">Overall GPA</th>
                    <th className="text-center">Overall Grade</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(rankings.rankings || []).map((student, index) => (
                    <tr key={student.student_id || student.id}>
                      <td className="text-center">{getRankBadge(index + 1)}</td>
                      <td>{student.student_id_number || student.studentIdNumber}</td>
                      <td>{student.student_name || student.studentName}</td>
                      <td className="text-center">{student.total_tests || student.totalTests || 0}</td>
                      <td className="text-center">
                        <span className="text-success">{(student.passed_tests || student.passedTests || 0)}</span> / 
                        <span className="text-danger"> {(student.failed_tests || student.failedTests || 0)}</span>
                      </td>
                      <td className="text-center">
                        <strong>{(student.overall_gpa || student.overallGPA || 0).toFixed(2)}</strong>
                      </td>
                      <td className="text-center">
                        {getGradeBadge(student.overall_grade || student.overallGrade)}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-info"
                            onClick={() => navigate(`/reports/student/${student.student_id || student.id}`)}
                            title="Grade Summary"
                          >
                            <i className="bi bi-bar-chart"></i>
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => navigate(`/reports/report-card/${student.student_id || student.id}`)}
                            title="Report Card"
                          >
                            <i className="bi bi-file-text"></i>
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

export default ClassRankings;