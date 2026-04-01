import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, TrendingUp, Award, BarChart, ChevronRight, Search, User, BookOpen, Calendar, Trophy, PieChart, Activity } from 'lucide-react';

const ReportDashboard = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [className, setClassName] = useState('N5');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('Semester 1');

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

  const handleRankings = () => {
    navigate(`/reports/rankings?className=${className}&academicYear=${academicYear}&semester=${semester}`);
  };

  const quickActions = [
    { icon: TrendingUp, label: 'Top Performers', color: '#10b981', onClick: () => handleRankings() },
    { icon: Award, label: 'Honor Roll', color: '#f59e0b', onClick: () => handleRankings() },
    { icon: BarChart, label: 'Class Analytics', color: '#0f6cbd', onClick: () => handleRankings() },
    { icon: FileText, label: 'Bulk Reports', color: '#8b5cf6', onClick: () => toast.info('Coming soon') },
  ];

  return (
    <div className="report-dashboard-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <Trophy size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Report Dashboard</h1>
            <p className="header-subtitle">View and manage academic performance reports, grade summaries, and class rankings</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>Grade Summary</h3>
            <p>View student grades by subject</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>Report Cards</h3>
            <p>Official academic records</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Trophy size={24} />
          </div>
          <div className="stat-info">
            <h3>Class Rankings</h3>
            <p>Compare student performance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <BarChart size={24} />
          </div>
          <div className="stat-info">
            <h3>Analytics</h3>
            <p>Performance insights</p>
          </div>
        </div>
      </div>

      {/* Main Cards Grid */}
      <div className="cards-grid">
        {/* Grade Summary Card */}
        <div className="report-card">
          <div className="card-header">
            <div className="card-icon grade-summary">
              <BarChart size={24} />
            </div>
            <h3>Grade Summary</h3>
          </div>
          <p className="card-description">
            Display grade summary for each student including GPA, test results, and course performance.
          </p>
          <form onSubmit={handleGradeSummary} className="card-form">
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input
                type="number"
                className="form-input"
                placeholder="Enter Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              <Search size={16} />
              <span>View Summary</span>
              <ChevronRight size={14} />
            </button>
          </form>
        </div>

        {/* Report Card Card */}
        <div className="report-card">
          <div className="card-header">
            <div className="card-icon report-card-icon">
              <FileText size={24} />
            </div>
            <h3>Report Card</h3>
          </div>
          <p className="card-description">
            Generate and view official report cards with detailed academic performance and GPA.
          </p>
          <form onSubmit={handleReportCard} className="card-form">
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input
                type="number"
                className="form-input"
                placeholder="Enter Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              <FileText size={16} />
              <span>Generate Report</span>
              <ChevronRight size={14} />
            </button>
          </form>
        </div>

        {/* Class Rankings Card */}
        <div className="report-card">
          <div className="card-header">
            <div className="card-icon rankings-icon">
              <Trophy size={24} />
            </div>
            <h3>Class Rankings</h3>
          </div>
          <p className="card-description">
            View rankings within class based on overall GPA and test performance.
          </p>
          <div className="rankings-filters">
            <div className="input-group">
              <BookOpen size={18} className="input-icon" />
              <select
                className="form-select"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="N5">N5 Class</option>
                <option value="N4">N4 Class</option>
                <option value="N3">N3 Class</option>
                <option value="N2">N2 Class</option>
                <option value="N1">N1 Class</option>
              </select>
            </div>
            <div className="input-group">
              <Calendar size={18} className="input-icon" />
              <select
                className="form-select"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div className="input-group">
              <Activity size={18} className="input-icon" />
              <select
                className="form-select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="Semester 1">First Semester</option>
                <option value="Semester 2">Second Semester</option>
              </select>
            </div>
          </div>
          <button className="btn-primary full-width" onClick={handleRankings}>
            <Trophy size={16} />
            <span>View Rankings</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions">
        <h4 className="section-title">
          <Activity size={18} />
          <span>Quick Actions</span>
        </h4>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button key={index} className="quick-action-btn" onClick={action.onClick}>
              <div className="action-icon" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                <action.icon size={20} />
              </div>
              <span>{action.label}</span>
              <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="recent-reports">
        <h4 className="section-title">
          <Clock size={18} />
          <span>Recent Reports</span>
        </h4>
        <div className="reports-list">
          {[1, 2, 3].map((item) => (
            <div key={item} className="report-item">
              <div className="report-info">
                <FileText size={16} className="report-icon" />
                <div>
                  <p className="report-name">Grade Summary - Student #STU00{item}</p>
                  <p className="report-date">Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <button className="btn-download" onClick={() => {}}>
                <Download size={14} />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .report-dashboard-module {
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
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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
          border: 1px solid #eef2ff;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }
        .stat-icon.orange { background: #fff3e0; color: #ed6c02; }

        .stat-info h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: #1e293b;
        }

        .stat-info p {
          margin: 0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .report-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid #eef2ff;
          transition: all 0.3s;
        }

        .report-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-icon.grade-summary {
          background: #e3f2fd;
          color: #1976d2;
        }

        .card-icon.report-card-icon {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .card-icon.rankings-icon {
          background: #fff3e0;
          color: #ed6c02;
        }

        .card-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .card-description {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }

        .card-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.2s;
          background: white;
        }

        .form-select {
          padding-right: 2rem;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #0f6cbd;
          box-shadow: 0 0 0 3px rgba(15, 108, 189, 0.1);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #0a58a0;
          gap: 0.75rem;
        }

        .btn-primary.full-width {
          width: 100%;
          margin-top: 1rem;
        }

        .rankings-filters {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .quick-actions {
          margin-bottom: 2rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: #1e293b;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: white;
          border: 1px solid #eef2ff;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-action-btn:hover {
          border-color: #0f6cbd;
          transform: translateX(4px);
        }

        .action-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-action-btn span {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
          text-align: left;
        }

        .quick-action-btn svg:last-child {
          color: #94a3b8;
        }

        .recent-reports {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid #eef2ff;
        }

        .reports-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .report-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .report-item:hover {
          background: #f1f5f9;
        }

        .report-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .report-icon {
          color: #64748b;
        }

        .report-name {
          font-size: 0.85rem;
          font-weight: 500;
          margin: 0;
          color: #1e293b;
        }

        .report-date {
          font-size: 0.7rem;
          margin: 0;
          color: #94a3b8;
        }

        .btn-download {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #0f6cbd;
        }

        .btn-download:hover {
          border-color: #0f6cbd;
          background: #e3f2fd;
        }

        @media (max-width: 768px) {
          .report-dashboard-module {
            padding: 1rem;
          }
          
          .module-header {
            padding: 1.5rem;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .cards-grid {
            grid-template-columns: 1fr;
          }
          
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

// Add Clock icon if not available
const Clock = ({ size, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default ReportDashboard;