import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, BookOpen, CheckCircle, Award, Calendar, Mail, User, Building2, Activity, ExternalLink, Briefcase, Clock, Users, ChevronRight, Phone, MapPin, Globe, FileText, CreditCard, Heart, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { studentService } from '../../api/studentService';
import { enrollmentService } from '../../api/enrollmentService';
import { resultService } from '../../api/resultService';

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const studentResponse = await studentService.getById(id);
      setStudent(studentResponse);
      
      try {
        const enrollmentsResponse = await enrollmentService.getByStudent(id);
        setEnrollments(enrollmentsResponse || []);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setEnrollments([]);
      }
      
      try {
        const resultsResponse = await resultService.getByStudent(id);
        setResults(resultsResponse || []);
      } catch (err) {
        console.error('Error fetching results:', err);
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to load student information');
      navigate('/students');
    } finally {
      setLoading(false);
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ENROLLED': { class: 'enrolled', label: 'Enrolled', icon: '🎓' },
      'ACCEPTED': { class: 'accepted', label: 'Accepted', icon: '✅' },
      'PENDING': { class: 'pending', label: 'Pending', icon: '⏳' },
      'REJECTED': { class: 'rejected', label: 'Rejected', icon: '❌' },
      'COMPLETED': { class: 'completed', label: 'Completed', icon: '🏆' }
    };
    const config = statusConfig[status] || { class: 'default', label: status, icon: '📌' };
    
    return (
      <span className={`status-badge-large ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    const gradeMap = {
      'A': 'grade-a',
      'B': 'grade-b',
      'C': 'grade-c',
      'D': 'grade-d',
      'F': 'grade-f'
    };
    return gradeMap[grade] || 'default';
  };

  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled' || e.status === 'active').length;
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const averageGPA = results.length > 0 
    ? (results.reduce((sum, r) => sum + (parseFloat(r.gpa) || 0), 0) / results.length).toFixed(2)
    : 'N/A';

  if (loading) {
    return (
      <div className="details-loading">
        <div className="loading-spinner"></div>
        <p>Loading student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="not-found">
        <div className="not-found-icon">👨‍🎓</div>
        <h2>Student Not Found</h2>
        <p>The student you're looking for doesn't exist or has been removed.</p>
        <button className="btn-primary" onClick={() => navigate('/students')}>
          Back to Student List
        </button>
      </div>
    );
  }

  return (
    <div className="student-details-module">
      {/* Header Actions */}
      <div className="details-actions">
        <button className="action-back" onClick={() => navigate('/students')}>
          <ArrowLeft size={18} />
          <span>Back to Students</span>
        </button>
        <button className="action-edit" onClick={() => navigate(`/students/${id}/edit`)}>
          <Edit size={18} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-large">
            {getInitials(student.student_name)}
          </div>
          {getStatusBadge(student.registration_status)}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{student.student_name}</h1>
          <div className="profile-badge">{student.student_id}</div>
          <div className="profile-contact">
            <div className="contact-item">
              <Mail size={14} />
              <a href={`mailto:${student.email}`}>{student.email || 'No email'}</a>
            </div>
            <div className="contact-item">
              <Phone size={14} />
              <span>{student.phone_number || 'No phone'}</span>
            </div>
            {student.national_id && (
              <div className="contact-item">
                <FileText size={14} />
                <span>ID: {student.national_id}</span>
              </div>
            )}
            {student.date_of_birth && (
              <div className="contact-item">
                <Calendar size={14} />
                <span>Born: {formatDate(student.date_of_birth)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-value">{enrollments.length}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-value">{activeEnrollments}</div>
          <div className="stat-label">Active Courses</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon purple">
            <Award size={24} />
          </div>
          <div className="stat-value">{completedCourses}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon orange">
            <Activity size={24} />
          </div>
          <div className="stat-value">{averageGPA}</div>
          <div className="stat-label">Avg GPA</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <User size={16} />
          <span>Personal Info</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={16} />
          <span>Enrolled Courses</span>
          <span className="tab-count">{enrollments.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <Award size={16} />
          <span>Academic Results</span>
          <span className="tab-count">{results.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="info-section">
            <div className="info-card-detail">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-field">
                  <label>Full Name</label>
                  <div className="field-value">{student.student_name}</div>
                </div>
                <div className="info-field">
                  <label>Student ID</label>
                  <div className="field-value">{student.student_id}</div>
                </div>
                <div className="info-field">
                  <label>National ID</label>
                  <div className="field-value">{student.national_id || 'Not specified'}</div>
                </div>
                <div className="info-field">
                  <label>Date of Birth</label>
                  <div className="field-value">{formatDate(student.date_of_birth)}</div>
                </div>
                <div className="info-field">
                  <label>Gender</label>
                  <div className="field-value">{student.gender || 'Not specified'}</div>
                </div>
                <div className="info-field">
                  <label>Registration Status</label>
                  <div className="field-value">{getStatusBadge(student.registration_status)}</div>
                </div>
              </div>
            </div>

            <div className="info-card-detail">
              <h3>Contact Information</h3>
              <div className="info-grid">
                <div className="info-field">
                  <label>Email Address</label>
                  <div className="field-value">
                    <a href={`mailto:${student.email}`}>{student.email || 'Not specified'}</a>
                  </div>
                </div>
                <div className="info-field">
                  <label>Phone Number</label>
                  <div className="field-value">{student.phone_number || 'Not specified'}</div>
                </div>
                <div className="info-field">
                  <label>Current Address</label>
                  <div className="field-value">{student.current_living_address || 'Not specified'}</div>
                </div>
                <div className="info-field">
                  <label>Hometown Address</label>
                  <div className="field-value">{student.home_town_address || 'Not specified'}</div>
                </div>
              </div>
            </div>

            {student.additional_info && (
              <div className="info-card-detail">
                <h3>Additional & Japan Information</h3>
                <div className="info-grid">
                  <div className="info-field">
                    <label>Name in Japanese</label>
                    <div className="field-value">{student.additional_info.name_in_japanese || 'Not specified'}</div>
                  </div>
                  <div className="info-field">
                    <label>Passport Number</label>
                    <div className="field-value">{student.additional_info.passport_number || 'Not specified'}</div>
                  </div>
                  <div className="info-field">
                    <label>Highest JLPT Level</label>
                    <div className="field-value">{student.additional_info.passed_highest_jlpt_level || 'Not specified'}</div>
                  </div>
                  <div className="info-field">
                    <label>Desired Job Type</label>
                    <div className="field-value">{student.additional_info.desired_job_type || 'Not specified'}</div>
                  </div>
                  <div className="info-field">
                    <label>Father's Name</label>
                    <div className="field-value">{student.additional_info.father_name || 'Not specified'}</div>
                  </div>
                  <div className="info-field">
                    <label>Viber Contact</label>
                    <div className="field-value">{student.additional_info.contact_viber || 'Not specified'}</div>
                  </div>
                </div>
                <div className="preferences-section">
                  <label>Preferences</label>
                  <div className="preferences-badges">
                    {student.additional_info.is_smoking && <span className="pref-badge">🚬 Smoking</span>}
                    {student.additional_info.is_alcohol_drink && <span className="pref-badge">🍺 Alcohol</span>}
                    {student.additional_info.have_tatto && <span className="pref-badge">🎨 Tattoo</span>}
                    {student.additional_info.hostel_preference && <span className="pref-badge">🏠 Hostel Required</span>}
                    {!student.additional_info.is_smoking && !student.additional_info.is_alcohol_drink && 
                     !student.additional_info.have_tatto && !student.additional_info.hostel_preference && 
                     <span className="pref-badge muted">No preferences set</span>}
                  </div>
                </div>
              </div>
            )}

            <div className="info-card-detail">
              <h3>System Information</h3>
              <div className="info-grid">
                <div className="info-field">
                  <label>Enrolled Date</label>
                  <div className="field-value">{formatDate(student.enrolled_date)}</div>
                </div>
                <div className="info-field">
                  <label>Created At</label>
                  <div className="field-value">{formatDate(student.created_at)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-section">
            {enrollments.length === 0 ? (
              <div className="empty-courses">
                <div className="empty-icon">📚</div>
                <h3>No Courses Enrolled</h3>
                <p>This student hasn't been enrolled in any courses yet.</p>
                <Link to="/enrollments/new" className="btn-outline">
                  <Plus size={18} />
                  <span>Enroll in a Course</span>
                </Link>
              </div>
            ) : (
              <div className="courses-list">
                {enrollments.map(enrollment => (
                  <div key={enrollment.enrollment_id || enrollment.id} className="course-card">
                    <div className="course-header">
                      <span className="course-code">{enrollment.course_code || enrollment.courseCode}</span>
                      <span className={`course-status ${enrollment.status === 'enrolled' || enrollment.status === 'active' ? 'active' : 'completed'}`}>
                        {enrollment.status}
                      </span>
                    </div>
                    <h3 className="course-name">{enrollment.course_name || enrollment.courseName}</h3>
                    <div className="course-meta">
                      <div className="meta-item">
                        <Calendar size={12} />
                        <span>Semester: {enrollment.semester || 'Not specified'}</span>
                      </div>
                      <div className="meta-item">
                        <Award size={12} />
                        <span>Credit Hours: {enrollment.credit_hours || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="course-footer">
                      <Link to={`/courses/${enrollment.course_id || enrollment.courseId}`} className="view-link">
                        <span>View Course Details</span>
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="results-section">
            {results.length === 0 ? (
              <div className="empty-results">
                <div className="empty-icon">📊</div>
                <h3>No Academic Results</h3>
                <p>No test results have been recorded for this student yet.</p>
              </div>
            ) : (
              <div className="results-list">
                <div className="results-header">
                  <div className="result-col">Course</div>
                  <div className="result-col">Test</div>
                  <div className="result-col">Score</div>
                  <div className="result-col">Grade</div>
                  <div className="result-col">GPA</div>
                  <div className="result-col">Status</div>
                </div>
                {results.map(result => (
                  <div key={result.id} className="result-row">
                    <div className="result-col course-col">
                      <span className="result-course-name">{result.course_name || result.courseName}</span>
                    </div>
                    <div className="result-col">
                      <span className="result-test-name">{result.test_name || result.testName}</span>
                    </div>
                    <div className="result-col">
                      <span className="result-score">{result.score_obtained || result.scoreObtained}/{result.total_marks || result.totalMarks}</span>
                    </div>
                    <div className="result-col">
                      <span className={`result-grade ${getGradeColor(result.grade)}`}>{result.grade || '-'}</span>
                    </div>
                    <div className="result-col">
                      <span className="result-gpa">{result.gpa || '-'}</span>
                    </div>
                    <div className="result-col">
                      <span className={`result-status ${result.result === 'PASS' ? 'pass' : 'fail'}`}>
                        {result.result || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .student-details-module {
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

        .action-back, .action-edit {
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

        .profile-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 24px;
          padding: 2rem;
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .profile-avatar {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
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

        .status-badge-large {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge-large.enrolled {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge-large.accepted {
          background: #e3f2fd;
          color: #1565c0;
        }

        .status-badge-large.pending {
          background: #fff3e0;
          color: #ed6c02;
        }

        .status-badge-large.rejected {
          background: #ffebee;
          color: #c62828;
        }

        .status-badge-large.completed {
          background: #e0f7fa;
          color: #00838f;
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

        .profile-contact {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #475569;
        }

        .contact-item a {
          color: #0f6cbd;
          text-decoration: none;
        }

        .contact-item a:hover {
          text-decoration: underline;
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

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-card-detail {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid #eef2ff;
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

        .field-value a {
          color: #0f6cbd;
          text-decoration: none;
        }

        .preferences-section {
          margin-top: 1rem;
        }

        .preferences-section label {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 0.5rem;
        }

        .preferences-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .pref-badge {
          padding: 0.25rem 0.75rem;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #475569;
        }

        .pref-badge.muted {
          background: #f8fafc;
          color: #94a3b8;
        }

        .courses-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .course-card {
          background: white;
          border-radius: 16px;
          padding: 1.25rem;
          border: 1px solid #eef2ff;
          transition: all 0.2s;
        }

        .course-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .course-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .course-code {
          font-family: monospace;
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          background: #f1f5f9;
          border-radius: 6px;
          color: #475569;
        }

        .course-status {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
        }

        .course-status.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .course-status.completed {
          background: #e0f7fa;
          color: #00838f;
        }

        .course-name {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #0f172a;
        }

        .course-meta {
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

        .course-footer {
          padding-top: 0.75rem;
          border-top: 1px solid #eef2ff;
        }

        .view-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #0f6cbd;
          text-decoration: none;
        }

        .view-link:hover {
          gap: 0.75rem;
        }

        .results-list {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #eef2ff;
        }

        .results-header {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: #f8fafc;
          font-weight: 600;
          font-size: 0.8rem;
          color: #475569;
          border-bottom: 1px solid #eef2ff;
        }

        .result-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .result-row:hover {
          background: #fafbff;
        }

        .result-col {
          display: flex;
          align-items: center;
        }

        .result-course-name,
        .result-test-name {
          font-size: 0.85rem;
          color: #1e293b;
        }

        .result-score {
          font-weight: 500;
          color: #334155;
        }

        .result-grade {
          display: inline-block;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .result-grade.grade-a {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .result-grade.grade-b {
          background: #e3f2fd;
          color: #1565c0;
        }

        .result-grade.grade-c {
          background: #fff3e0;
          color: #ed6c02;
        }

        .result-grade.grade-d {
          background: #ffebee;
          color: #c62828;
        }

        .result-grade.grade-f {
          background: #ffebee;
          color: #c62828;
        }

        .result-gpa {
          font-weight: 500;
          color: #334155;
        }

        .result-status {
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .result-status.pass {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .result-status.fail {
          background: #ffebee;
          color: #c62828;
        }

        .empty-courses,
        .empty-results {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 24px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-courses h3,
        .empty-results h3 {
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .empty-courses p,
        .empty-results p {
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

        @media (max-width: 768px) {
          .student-details-module {
            padding: 1rem;
          }
          
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .profile-contact {
            justify-content: center;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .results-header,
          .result-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .results-header {
            display: none;
          }
          
          .result-row {
            border-bottom: 1px solid #eef2ff;
            padding: 1rem;
          }
          
          .result-col {
            justify-content: space-between;
          }
          
          .result-col::before {
            content: attr(data-label);
            font-weight: 600;
            color: #64748b;
          }
          
          .courses-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDetail;