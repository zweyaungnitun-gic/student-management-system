import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, BookOpen, CheckCircle, Award, Calendar, Mail, User, Building2, Activity, ExternalLink, Briefcase, Clock, Users, ChevronRight, MailOpen, Phone, MapPin, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { teacherService } from '../../api/teacherService';
import { courseService } from '../../api/courseService';

const TeacherDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    fetchTeacherDetails();
  }, [id]);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      const teacherResponse = await teacherService.getById(id);
      setTeacher(teacherResponse);
      
      try {
        const coursesResponse = await courseService.getByTeacher(id);
        setCourses(coursesResponse || []);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      toast.error('Failed to load teacher information');
      navigate('/teachers');
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

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const activeCourses = courses.filter(c => c.is_active).length;
  const totalCredits = courses.reduce((sum, c) => sum + (c.credit_hours || 0), 0);

  if (loading) {
    return (
      <div className="details-loading">
        <div className="loading-spinner"></div>
        <p>Loading teacher profile...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="not-found">
        <div className="not-found-icon">👩‍🏫</div>
        <h2>Teacher Not Found</h2>
        <p>The teacher you're looking for doesn't exist or has been removed.</p>
        <button className="btn-primary" onClick={() => navigate('/teachers')}>
          Back to Teacher List
        </button>
      </div>
    );
  }

  return (
    <div className="teacher-details-module">
      {/* Header Actions */}
      <div className="details-actions">
        <button className="action-back" onClick={() => navigate('/teachers')}>
          <ArrowLeft size={18} />
          <span>Back to Teachers</span>
        </button>
        <button className="action-edit" onClick={() => navigate(`/teachers/${id}/edit`)}>
          <Edit size={18} />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-large">
            {getInitials(teacher.name)}
          </div>
          <div className={`status-badge ${teacher.is_active ? 'active' : 'inactive'}`}>
            {teacher.is_active ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{teacher.name}</h1>
          <div className="profile-badge">{teacher.teacher_code || teacher.teacherCode}</div>
          <div className="profile-contact">
            <div className="contact-item">
              <Mail size={14} />
              <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
            </div>
            {teacher.department && (
              <div className="contact-item">
                <Building2 size={14} />
                <span>{teacher.department}</span>
              </div>
            )}
            <div className="contact-item">
              <Calendar size={14} />
              <span>Joined {formatDate(teacher.created_at || teacher.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon green">
            <CheckCircle size={24} />
          </div>
          <div className="stat-value">{activeCourses}</div>
          <div className="stat-label">Active Courses</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon purple">
            <Award size={24} />
          </div>
          <div className="stat-value">{totalCredits}</div>
          <div className="stat-label">Total Credits</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon orange">
            <Users size={24} />
          </div>
          <div className="stat-value">{courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0)}</div>
          <div className="stat-label">Students Taught</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={16} />
          <span>Assigned Courses</span>
          <span className="tab-count">{courses.length}</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <User size={16} />
          <span>Profile Information</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'courses' && (
          <div className="courses-section">
            {courses.length === 0 ? (
              <div className="empty-courses">
                <div className="empty-icon">📚</div>
                <h3>No Courses Assigned</h3>
                <p>This teacher hasn't been assigned to any courses yet.</p>
                <Link to="/courses/new" className="btn-outline">
                  <Plus size={18} />
                  <span>Assign a Course</span>
                </Link>
              </div>
            ) : (
              <div className="courses-list">
                {courses.map(course => (
                  <div key={course.course_id || course.courseId} className="course-card">
                    <div className="course-header">
                      <span className="course-code">{course.course_code || course.courseCode}</span>
                      <span className={`course-status ${course.is_active ? 'active' : 'inactive'}`}>
                        {course.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <h3 className="course-name">{course.course_name || course.courseName}</h3>
                    {course.description && (
                      <p className="course-description">{course.description}</p>
                    )}
                    <div className="course-meta">
                      <div className="meta-item">
                        <Award size={12} />
                        <span>{course.credit_hours || course.creditHours} Credits</span>
                      </div>
                      {course.enrollment_count > 0 && (
                        <div className="meta-item">
                          <Users size={12} />
                          <span>{course.enrollment_count} Students</span>
                        </div>
                      )}
                    </div>
                    <div className="course-footer">
                      <Link to={`/courses/${course.course_id || course.courseId}`} className="view-link">
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

        {activeTab === 'info' && (
          <div className="info-section">
            <div className="info-card-detail">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-field">
                  <label>Full Name</label>
                  <div className="field-value">{teacher.name}</div>
                </div>
                <div className="info-field">
                  <label>Teacher ID</label>
                  <div className="field-value">{teacher.teacher_code || teacher.teacherCode}</div>
                </div>
                <div className="info-field">
                  <label>Email Address</label>
                  <div className="field-value">
                    <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
                  </div>
                </div>
                <div className="info-field">
                  <label>Department</label>
                  <div className="field-value">{teacher.department || 'Not specified'}</div>
                </div>
                <div className="info-field">
                  <label>Status</label>
                  <div className="field-value">
                    <span className={`status-badge-small ${teacher.is_active ? 'active' : 'inactive'}`}>
                      {teacher.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="info-field">
                  <label>Registered Date</label>
                  <div className="field-value">{formatDateTime(teacher.created_at || teacher.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .teacher-details-module {
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

        .course-status.inactive {
          background: #ffebee;
          color: #c62828;
        }

        .course-name {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #0f172a;
        }

        .course-description {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 1rem 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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

        .empty-courses {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 24px;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-courses h3 {
          font-size: 1.1rem;
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .empty-courses p {
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

        .info-section {
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

        .field-value a {
          color: #0f6cbd;
          text-decoration: none;
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

        @media (max-width: 768px) {
          .teacher-details-module {
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
          
          .courses-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDetails;