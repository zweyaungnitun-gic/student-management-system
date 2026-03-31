import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit, BookOpen, Users, Award, FileText, Calendar, User, Building2, Activity, ExternalLink, Clock, CheckCircle, XCircle, Download, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../../api/courseService';

const CourseDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [tests, setTests] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrollments');

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseResponse = await courseService.getById(id);
      setCourse(courseResponse);
      
      try {
        const enrollmentsResponse = await courseService.getEnrollments(id);
        setEnrollments(enrollmentsResponse || []);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setEnrollments([]);
      }
      
      try {
        const testsResponse = await courseService.getTests(id);
        setTests(testsResponse || []);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setTests([]);
      }
      
      try {
        const statsResponse = await courseService.getStatistics(id);
        setStatistics(statsResponse || {});
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setStatistics({});
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course information');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await courseService.exportStudents(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${course?.course_code || course?.courseCode}_students.csv`);
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
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'enrolled': { class: 'success', text: 'Enrolled', icon: '✓' },
      'pending': { class: 'warning', text: 'Pending', icon: '⏳' },
      'completed': { class: 'info', text: 'Completed', icon: '✓' },
      'dropped': { class: 'danger', text: 'Dropped', icon: '✗' },
      'failed': { class: 'danger', text: 'Failed', icon: '✗' }
    };
    const s = statusMap[status] || { class: 'secondary', text: status || 'Unknown', icon: '•' };
    return (
      <span className={`status-badge ${s.class}`}>
        <span className="status-icon">{s.icon}</span>
        {s.text}
      </span>
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="details-loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="not-found">
        <div className="not-found-icon">📚</div>
        <h2>Course Not Found</h2>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <button className="btn-primary" onClick={() => navigate('/courses')}>
          Back to Course List
        </button>
      </div>
    );
  }

  const courseId = course.course_id || course.courseId;
  const courseCode = course.course_code || course.courseCode;
  const courseName = course.course_name || course.courseName;
  const teacherName = course.teacher_name || course.teacherName;
  const isActive = course.is_active;
  const creditHours = course.credit_hours || course.creditHours;
  const createdAt = course.created_at || course.createdAt;

  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled').length;
  const totalStudents = enrollments.length;
  const passedStudents = enrollments.filter(e => e.status === 'completed').length;

  return (
    <div className="course-details-module">
      {/* Header Actions */}
      <div className="details-actions">
        <button className="action-back" onClick={() => navigate('/courses')}>
          <ArrowLeft size={18} />
          <span>Back to Courses</span>
        </button>
        <div className="actions-right">
          <button className="action-export" onClick={handleExport}>
            <Download size={18} />
            <span>Export Students</span>
          </button>
          <button className="action-edit" onClick={() => navigate(`/courses/${courseId}/edit`)}>
            <Edit size={18} />
            <span>Edit Course</span>
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-large">
            {getInitials(courseName)}
          </div>
          <div className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{courseName}</h1>
          <div className="profile-badge">{courseCode}</div>
          <div className="profile-details">
            <div className="detail-item">
              <Award size={14} />
              <span>{creditHours} Credits</span>
            </div>
            {teacherName && (
              <div className="detail-item">
                <User size={14} />
                <span>Instructor: {teacherName}</span>
              </div>
            )}
            <div className="detail-item">
              <Calendar size={14} />
              <span>Created {formatDate(createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-value">{activeEnrollments}</div>
          <div className="stat-label">Active Enrollments</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon purple">
            <FileText size={24} />
          </div>
          <div className="stat-value">{tests.length}</div>
          <div className="stat-label">Total Tests</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon orange">
            <Award size={24} />
          </div>
          <div className="stat-value">{statistics.average_score || statistics.averageScore || '-'}</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
          onClick={() => setActiveTab('enrollments')}
        >
          <Users size={16} />
          <span>Enrolled Students</span>
          <span className="tab-count">{enrollments.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          <FileText size={16} />
          <span>Course Tests</span>
          <span className="tab-count">{tests.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <Info size={16} />
          <span>Course Information</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'enrollments' && (
          <div className="enrollments-section">
            {enrollments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Students Enrolled</h3>
                <p>This course doesn't have any enrolled students yet.</p>
                <Link to="/enrollments/new" className="btn-outline">
                  <Users size={18} />
                  <span>Add Enrollment</span>
                </Link>
              </div>
            ) : (
              <div className="students-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Enrollment Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map(enrollment => (
                      <tr key={enrollment.enrollment_id || enrollment.enrollmentId}>
                        <td>
                          <span className="student-id">
                            {enrollment.student_id || enrollment.studentId}
                          </span>
                        </td>
                        <td className="student-name">
                          {enrollment.student_name || enrollment.studentName}
                        </td>
                        <td>{getStatusBadge(enrollment.status)}</td>
                        <td>{formatDate(enrollment.enrollment_date || enrollment.enrollmentRequestDate)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => navigate(`/students/${enrollment.student_id || enrollment.studentId}`)}
                              title="View Student"
                            >
                              <User size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => navigate(`/results/student/${enrollment.student_id || enrollment.studentId}`)}
                              title="View Results"
                            >
                              <Award size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="tests-section">
            {tests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No Tests Created</h3>
                <p>This course doesn't have any tests yet.</p>
                <Link to={`/tests/new?courseId=${courseId}`} className="btn-outline">
                  <FileText size={18} />
                  <span>Create Test</span>
                </Link>
              </div>
            ) : (
              <div className="tests-list">
                {tests.map(test => (
                  <div key={test.test_id || test.testId} className="test-card">
                    <div className="test-header">
                      <h3 className="test-name">{test.test_name || test.testName}</h3>
                      <div className="test-marks">
                        <span className="total-marks">Total: {test.total_marks || test.totalMarks}</span>
                        <span className="passing-marks">Passing: {test.passing_marks || test.passingMarks}</span>
                      </div>
                    </div>
                    {test.description && (
                      <p className="test-description">{test.description}</p>
                    )}
                    <div className="test-meta">
                      <div className="meta-item">
                        <Clock size={14} />
                        <span>{test.duration_minutes || test.durationMinutes} minutes</span>
                      </div>
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>{formatDateTime(test.test_date || test.testDate)}</span>
                      </div>
                    </div>
                    <div className="test-footer">
                      <Link to={`/tests/${test.test_id || test.testId}`} className="view-link">
                        <span>View Test Details</span>
                        <ExternalLink size={14} />
                      </Link>
                      <Link to={`/results/add?testId=${test.test_id || test.testId}`} className="add-results-link">
                        <span>Add Results</span>
                        <Plus size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="info-section">
            <div className="info-card-detail">
              <h3>Course Information</h3>
              <div className="info-grid">
                <div className="info-field">
                  <label>Course Code</label>
                  <div className="field-value">{courseCode}</div>
                </div>
                <div className="info-field">
                  <label>Course Name</label>
                  <div className="field-value">{courseName}</div>
                </div>
                <div className="info-field">
                  <label>Credit Hours</label>
                  <div className="field-value">{creditHours}</div>
                </div>
                <div className="info-field">
                  <label>Instructor</label>
                  <div className="field-value">{teacherName || 'Not assigned'}</div>
                </div>
                <div className="info-field">
                  <label>Status</label>
                  <div className="field-value">
                    <span className={`status-badge-small ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="info-field">
                  <label>Created Date</label>
                  <div className="field-value">{formatDateTime(createdAt)}</div>
                </div>
              </div>
            </div>

            {course.description && (
              <div className="info-card-detail">
                <h3>Description</h3>
                <div className="description-content">
                  {course.description}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .course-details-module {
          padding: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .details-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0f6cbd;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .not-found {
          text-align: center;
          padding: 4rem 2rem;
        }

        .not-found-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .not-found h2 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .not-found p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          padding: 0.75rem 1.5rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }

        .details-actions {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .actions-right {
          display: flex;
          gap: 0.75rem;
        }

        .action-back, .action-edit, .action-export {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
          border: none;
          background: white;
        }

        .action-back {
          border: 1px solid #e2e8f0;
        }

        .action-back:hover {
          background: #f8fafc;
          border-color: #0f6cbd;
        }

        .action-edit {
          background: #0f6cbd;
          color: white;
        }

        .action-edit:hover {
          background: #0a58a0;
        }

        .action-export {
          border: 1px solid #10b981;
          color: #10b981;
        }

        .action-export:hover {
          background: #f0fdf4;
          border-color: #059669;
        }

        .profile-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 24px;
          padding: 2rem;
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .profile-avatar {
          position: relative;
        }

        .avatar-large {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
        }

        .status-badge {
          position: absolute;
          bottom: 0;
          right: 0;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .status-badge.active {
          color: #2e7d32;
        }

        .status-badge.inactive {
          color: #c62828;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #0f172a;
        }

        .profile-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #e2e8f0;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #475569;
          margin-bottom: 1rem;
        }

        .profile-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #475569;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          background: white;
          border-radius: 20px;
          padding: 1.25rem;
          text-align: center;
          border: 1px solid #eef2ff;
          transition: transform 0.2s;
        }

        .stat-item:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }
        .stat-icon.orange { background: #fff3e0; color: #ed6c02; }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .tabs-container {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #eef2ff;
          margin-bottom: 1.5rem;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
          position: relative;
        }

        .tab-btn.active {
          color: #0f6cbd;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #0f6cbd;
        }

        .tab-count {
          background: #e2e8f0;
          padding: 0.125rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
        }

        .tab-content {
          min-height: 400px;
        }

        /* Table Styles */
        .students-table-container {
          background: white;
          border-radius: 16px;
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .student-id {
          font-family: monospace;
          font-size: 0.85rem;
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .student-name {
          font-weight: 500;
          color: #1e293b;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.success { background: #e8f5e9; color: #2e7d32; }
        .status-badge.warning { background: #fff3e0; color: #ed6c02; }
        .status-badge.info { background: #e3f2fd; color: #1976d2; }
        .status-badge.danger { background: #ffebee; color: #c62828; }
        .status-badge.secondary { background: #e2e8f0; color: #475569; }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          transition: color 0.2s;
        }

        .btn-icon:hover {
          color: #0f6cbd;
        }

        /* Tests List */
        .tests-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1rem;
        }

        .test-card {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          border: 1px solid #eef2ff;
          transition: all 0.2s;
        }

        .test-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .test-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.75rem;
        }

        .test-name {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: #0f172a;
        }

        .test-marks {
          display: flex;
          gap: 0.5rem;
          font-size: 0.7rem;
        }

        .total-marks {
          background: #e3f2fd;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          color: #1976d2;
        }

        .passing-marks {
          background: #e8f5e9;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          color: #2e7d32;
        }

        .test-description {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .test-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: #64748b;
        }

        .test-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid #eef2ff;
        }

        .view-link, .add-results-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          text-decoration: none;
          transition: gap 0.2s;
        }

        .view-link {
          color: #0f6cbd;
        }

        .add-results-link {
          color: #10b981;
        }

        .view-link:hover, .add-results-link:hover {
          gap: 0.75rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 24px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: 1px solid #0f6cbd;
          border-radius: 12px;
          color: #0f6cbd;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #0f6cbd;
          color: white;
        }

        /* Info Section */
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-card-detail {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
        }

        .info-card-detail h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #eef2ff;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .info-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-field label {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.5px;
        }

        .field-value {
          font-size: 0.9rem;
          color: #1e293b;
        }

        .status-badge-small {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-badge-small.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge-small.inactive {
          background: #ffebee;
          color: #c62828;
        }

        .description-content {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .course-details-module {
            padding: 1rem;
          }
          
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .profile-details {
            justify-content: center;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .tests-list {
            grid-template-columns: 1fr;
          }
          
          .details-actions {
            flex-direction: column;
          }
          
          .actions-right {
            width: 100%;
          }
          
          .action-edit, .action-export {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseDetails;