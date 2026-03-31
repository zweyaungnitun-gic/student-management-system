import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeft, 
  Users, 
  GraduationCap, 
  BookOpen, 
  School,
  Pencil,
  Trash2,
  BarChart3,
  Calendar,
  Mail,
  User
} from 'lucide-react';
import { userService } from '../../api/userService';
import { studentService } from '../../api/studentService';
import { teacherService } from '../../api/teacherService';
import { courseService } from '../../api/courseService';
import toast from 'react-hot-toast';

const TenantAdminDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantData, setTenantData] = useState({
    students: [],
    teachers: [],
    courses: [],
    enrollments: []
  });

  useEffect(() => {
    fetchTenantDetails();
  }, [id]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      // Fetch tenant admin details
      const user = await userService.getById(id);
      setTenant(user);

      // Fetch tenant's data
      const [students, teachers, courses] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
        courseService.getAll()
      ]);

      setTenantData({
        students: students || [],
        teachers: teachers || [],
        courses: courses || [],
        enrollments: []
      });
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      toast.error(t('enrollment.form.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('superAdmin.tenant.confirmDelete'))) {
      try {
        await userService.delete(id);
        toast.success(t('enrollment.list.deleteSuccess'));
        navigate('/super-admin');
      } catch (error) {
        console.error('Error deleting tenant:', error);
        toast.error(t('enrollment.list.deleteError'));
      }
    }
  };

  const StatCard = ({ icon, title, value, color, onClick }) => (
    <div 
      className="card border-0 shadow-sm h-100" 
      style={{ borderRadius: '12px', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="card-body d-flex align-items-center p-4">
        <div 
          className="d-flex align-items-center justify-content-center rounded-3 me-3" 
          style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: `${color}15`,
            color: color
          }}
        >
          {icon}
        </div>
        <div>
          <h6 className="text-muted mb-1" style={{ fontSize: '0.875rem' }}>{title}</h6>
          <h3 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>{value}</h3>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-5">
        <h5 className="text-muted">{t('superAdmin.tenant.noTenants')}</h5>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/super-admin')}>
          <ChevronLeft size={16} className="me-2" />
          {t('enrollment.form.cancel')}
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-4">
        <button 
          className="btn btn-outline-secondary btn-sm mb-3 d-flex align-items-center gap-2"
          onClick={() => navigate('/super-admin')}
        >
          <ChevronLeft size={16} />
          {t('enrollment.form.cancel')}
        </button>
        
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-4">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ 
                width: '80px', 
                height: '80px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '2rem'
              }}
            >
              {tenant.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="mb-1" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
                {tenant.username}
              </h1>
              <div className="d-flex align-items-center gap-3 text-muted">
                <span className="d-flex align-items-center gap-1">
                  <Mail size={16} />
                  {tenant.email}
                </span>
                <span className="d-flex align-items-center gap-1">
                  <School size={16} />
                  {tenant.school_name || tenant.schoolName || '-'}
                </span>
                <span className="badge bg-primary rounded-pill">
                  {t('superAdmin.role.admin')}
                </span>
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              onClick={() => navigate(`/users/${tenant.id}/edit`)}
            >
              <Pencil size={18} />
              {t('superAdmin.tenant.edit')}
            </button>
            <button
              className="btn btn-outline-danger d-flex align-items-center gap-2"
              onClick={handleDelete}
            >
              <Trash2 size={18} />
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard 
            icon={<GraduationCap size={28} />}
            title={t('superAdmin.tenant.totalStudents')}
            value={tenantData.students.length}
            color="#f093fb"
            onClick={() => setActiveTab('students')}
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            icon={<Users size={28} />}
            title={t('superAdmin.tenant.totalTeachers')}
            value={tenantData.teachers.length}
            color="#4facfe"
            onClick={() => setActiveTab('teachers')}
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            icon={<BookOpen size={28} />}
            title={t('superAdmin.tenant.totalCourses')}
            value={tenantData.courses.length}
            color="#43e97b"
            onClick={() => setActiveTab('courses')}
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            icon={<BarChart3 size={28} />}
            title={t('superAdmin.tenant.dataOverview')}
            value={t('superAdmin.tenant.manageData')}
            color="#667eea"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <div className="card-header bg-white border-bottom-0 pt-3 px-4">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                style={{ borderRadius: '8px' }}
              >
                <BarChart3 size={16} className="me-2" />
                {t('superAdmin.tenant.dataOverview')}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
                onClick={() => setActiveTab('students')}
                style={{ borderRadius: '8px' }}
              >
                <GraduationCap size={16} className="me-2" />
                {t('superAdmin.tenant.studentData')}
                <span className="badge bg-secondary ms-2">{tenantData.students.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'teachers' ? 'active' : ''}`}
                onClick={() => setActiveTab('teachers')}
                style={{ borderRadius: '8px' }}
              >
                <Users size={16} className="me-2" />
                {t('superAdmin.tenant.teacherData')}
                <span className="badge bg-secondary ms-2">{tenantData.teachers.length}</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
                style={{ borderRadius: '8px' }}
              >
                <BookOpen size={16} className="me-2" />
                {t('superAdmin.tenant.courseData')}
                <span className="badge bg-secondary ms-2">{tenantData.courses.length}</span>
              </button>
            </li>
          </ul>
        </div>
        <div className="card-body p-4">
          {activeTab === 'overview' && (
            <div className="text-center py-5">
              <BarChart3 size={64} className="text-muted mb-3 opacity-25" />
              <h5 className="text-muted">{t('superAdmin.tenant.dataOverview')}</h5>
              <p className="text-muted">Click on the stat cards or tabs above to view detailed data</p>
            </div>
          )}
          
          {activeTab === 'students' && (
            <div>
              <h6 className="mb-3">{t('superAdmin.tenant.studentData')}</h6>
              {tenantData.students.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <GraduationCap size={48} className="opacity-25 mb-2" />
                  <p>No students found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Student ID</th>
                        <th>Email</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantData.students.slice(0, 10).map((student) => (
                        <tr key={student.id}>
                          <td>{student.student_name || student.name}</td>
                          <td>{student.student_id || student.id}</td>
                          <td>{student.email || '-'}</td>
                          <td>
                            <span className="badge bg-success">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tenantData.students.length > 10 && (
                    <div className="text-center mt-3">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate('/students')}
                      >
                        View All {tenantData.students.length} Students
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'teachers' && (
            <div>
              <h6 className="mb-3">{t('superAdmin.tenant.teacherData')}</h6>
              {tenantData.teachers.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <Users size={48} className="opacity-25 mb-2" />
                  <p>No teachers found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantData.teachers.slice(0, 10).map((teacher) => (
                        <tr key={teacher.id}>
                          <td>{teacher.name}</td>
                          <td>{teacher.email}</td>
                          <td>{teacher.department || '-'}</td>
                          <td>
                            <span className={`badge ${teacher.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {teacher.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tenantData.teachers.length > 10 && (
                    <div className="text-center mt-3">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate('/teachers')}
                      >
                        View All {tenantData.teachers.length} Teachers
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div>
              <h6 className="mb-3">{t('superAdmin.tenant.courseData')}</h6>
              {tenantData.courses.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <BookOpen size={48} className="opacity-25 mb-2" />
                  <p>No courses found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Course Name</th>
                        <th>Course Code</th>
                        <th>Credit Hours</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantData.courses.slice(0, 10).map((course) => (
                        <tr key={course.id}>
                          <td>{course.course_name || course.name}</td>
                          <td>{course.course_code}</td>
                          <td>{course.credit_hours || '-'}</td>
                          <td>
                            <span className={`badge ${course.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {course.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tenantData.courses.length > 10 && (
                    <div className="text-center mt-3">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => navigate('/courses')}
                      >
                        View All {tenantData.courses.length} Courses
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantAdminDetail;
