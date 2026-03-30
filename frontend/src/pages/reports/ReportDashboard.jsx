import React from 'react';
import { useNavigate } from 'react-router-dom';

const ReportDashboard = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = React.useState('');
  const [className, setClassName] = React.useState('N5');

  const handleGradeSummary = (e) => {
    e.preventDefault();
    if (studentId) {
      navigate(`/reports/student/${studentId}`);
    }
  };

  const handleReportCard = (e) => {
    e.preventDefault();
    if (studentId) {
      navigate(`/reports/report-card/${studentId}`);
    }
  };

  return (
    <div>
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Report Dashboard
            </h1>
            <p className="text-muted mb-0">View and manage academic performance reports</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Grade Summary Card */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body text-center p-4">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                <i className="bi bi-bar-chart-line fs-1 text-primary"></i>
              </div>
              <h5 className="card-title fw-bold mb-2">Grade Summary</h5>
              <p className="card-text text-muted small mb-3">
                Display grade summary for each student including GPA, test results, and course performance.
              </p>
              <form onSubmit={handleGradeSummary}>
                <input
                  type="number"
                  className="form-control form-control-sm mb-2"
                  placeholder="Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary w-100">
                  <i className="bi bi-search me-2"></i>Show
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Report Card Card */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body text-center p-4">
              <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                <i className="bi bi-file-text fs-1 text-success"></i>
              </div>
              <h5 className="card-title fw-bold mb-2">Report Card</h5>
              <p className="card-text text-muted small mb-3">
                Generate and view official report cards in PDF format with detailed academic performance.
              </p>
              <form onSubmit={handleReportCard}>
                <input
                  type="number"
                  className="form-control form-control-sm mb-2"
                  placeholder="Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-success w-100">
                  <i className="bi bi-file-text me-2"></i>Show
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Class Rankings Card */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body text-center p-4">
              <div className="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                <i className="bi bi-trophy fs-1 text-warning"></i>
              </div>
              <h5 className="card-title fw-bold mb-2">Class Rankings</h5>
              <p className="card-text text-muted small mb-3">
                View rankings within class based on overall GPA and test performance.
              </p>
              <select
                className="form-select form-select-sm mb-2"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="N5">N5 Class</option>
                <option value="N4">N4 Class</option>
                <option value="N3">N3 Class</option>
                <option value="N2">N2 Class</option>
                <option value="N1">N1 Class</option>
              </select>
              <button
                className="btn btn-warning w-100"
                onClick={() => navigate(`/reports/rankings?className=${className}`)}
              >
                <i className="bi bi-trophy me-2"></i>Show
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;