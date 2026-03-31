import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Users, 
  GraduationCap, 
  BookOpen, 
  School,
  Eye,
  Pencil,
  Trash2,
  Building2,
  ChevronDown
} from 'lucide-react';
import { userService } from '../../api/userService';
import { studentService } from '../../api/studentService';
import { teacherService } from '../../api/teacherService';
import { courseService } from '../../api/courseService';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [tenantData, setTenantData] = useState({
    students: [],
    teachers: [],
    courses: [],
    enrollments: []
  });
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenantData = async (tenantId) => {
    try {
      setDataLoading(true);
      const [students, teachers, courses] = await Promise.all([
        studentService.getAll(),
        teacherService.getAll(),
        courseService.getAll()
      ]);
      
      // Filter data by tenant's owner_admin_id if available
      const filteredStudents = students.filter(s => s.owner_admin_id === tenantId || s.created_by === tenantId);
      const filteredTeachers = teachers.filter(t => t.owner_admin_id === tenantId);
      const filteredCourses = courses.filter(c => c.owner_admin_id === tenantId);
      
      setTenantData({
        students: filteredStudents,
        teachers: filteredTeachers,
        courses: filteredCourses,
        enrollments: []
      });
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast.error(t('enrollment.form.fetchError'));
    } finally {
      setDataLoading(false);
    }
  };

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    fetchTenantData(tenant.id);
  };

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const users = await userService.getAll();
      const tenantAdmins = users.filter(user => user.role === 'ADMIN');
      setTenants(tenantAdmins);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error(t('enrollment.list.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm(t('superAdmin.tenant.confirmDelete'))) {
      try {
        await userService.delete(userId);
        toast.success(t('enrollment.list.deleteSuccess'));
        fetchTenants();
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
          style={{ width: '60px', height: '60px', backgroundColor: `${color}15`, color: color }}
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

  return (
    <div className="fade-in">
      {/* Header with Admin Selector */}
      <div className="page-header mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 className="mb-1" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              {t('superAdmin.dashboard.title')}
            </h1>
            <p className="text-muted mb-0">{t('superAdmin.dashboard.subtitle')}</p>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            {/* Admin Selector Dropdown */}
            <div className="dropdown">
              <button 
                className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2 px-3 py-2"
                type="button" 
                data-bs-toggle="dropdown"
                style={{ borderRadius: '10px', minWidth: '220px' }}
              >
                <Building2 size={18} />
                <span className="text-truncate" style={{ maxWidth: '160px' }}>
                  {selectedTenant ? selectedTenant.username : 'Select Admin'}
                </span>
                <ChevronDown size={16} className="ms-auto" />
              </button>
              <ul className="dropdown-menu shadow-sm" style={{ minWidth: '220px', borderRadius: '10px', maxHeight: '300px', overflow: 'auto' }}>
                <li><h6 className="dropdown-header">Tenant Administrators</h6></li>
                {tenants.map((tenant) => (
                  <li key={tenant.id}>
                    <button 
                      className={`dropdown-item d-flex align-items-center gap-2 ${selectedTenant?.id === tenant.id ? 'active' : ''}`}
                      onClick={() => handleTenantSelect(tenant)}
                    >
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}
                      >
                        {tenant.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-start">
                        <div className="fw-semibold small">{tenant.username}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {tenant.school_name || tenant.schoolName || 'No school'}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
              onClick={() => navigate('/users/new')}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px'
              }}
            >
              <Plus size={20} />
              <span>{t('superAdmin.tenant.create')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Admin Info Card */}
      {selectedTenant && (
        <div className="card mb-4 border-0" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
          <div className="card-body d-flex align-items-center justify-content-between p-4">
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}
              >
                {selectedTenant.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="mb-0 fw-semibold">{selectedTenant.username}</h4>
                <div className="d-flex gap-3 text-muted small mt-1">
                  <span><i className="bi bi-envelope me-1"></i>{selectedTenant.email}</span>
                  <span><i className="bi bi-building me-1"></i>{selectedTenant.school_name || selectedTenant.schoolName || 'No school'}</span>
                </div>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-light"
                onClick={() => navigate(`/users/${selectedTenant.id}/edit`)}
              >
                <Pencil size={16} className="me-1" />
                Edit
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => handleDelete(selectedTenant.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview - Filtered by Selected Admin */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <StatCard 
            icon={<GraduationCap size={28} />}
            title={t('superAdmin.tenant.totalStudents')}
            value={selectedTenant ? tenantData.students.length : '-'}
            color="#f093fb"
            onClick={() => selectedTenant && setActiveTab('students')}
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            icon={<Users size={28} />}
            title={t('superAdmin.tenant.totalTeachers')}
            value={selectedTenant ? tenantData.teachers.length : '-'}
            color="#4facfe"
            onClick={() => selectedTenant && setActiveTab('teachers')}
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            icon={<BookOpen size={28} />}
            title={t('superAdmin.tenant.totalCourses')}
            value={selectedTenant ? tenantData.courses.length : '-'}
            color="#43e97b"
            onClick={() => selectedTenant && setActiveTab('courses')}
          />
        </div>
        <div className="col-md-3">
          <StatCard 
            icon={<School size={28} />}
            title={t('superAdmin.stats.totalTenants')}
            value={tenants.length}
            color="#667eea"
          />
        </div>
      </div>

      {/* Data Tables - Show when admin selected */}
      {selectedTenant ? (
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <div className="card-header bg-white border-bottom-0 pt-3 px-4">
            <ul className="nav nav-pills">
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
            {dataLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <>
                {activeTab === 'students' && (
                  <div>
                    {tenantData.students.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <GraduationCap size={48} className="mb-3 opacity-25" />
                        <p>No students found for this admin</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Name</th>
                              <th>Student ID</th>
                              <th>Email</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tenantData.students.map((student) => (
                              <tr key={student.id}>
                                <td className="fw-semibold">{student.student_name || student.name}</td>
                                <td>{student.student_id || student.id}</td>
                                <td>{student.email || '-'}</td>
                                <td><span className="badge bg-success">Active</span></td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/students/${student.id}`)}
                                  >
                                    <Eye size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'teachers' && (
                  <div>
                    {tenantData.teachers.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <Users size={48} className="mb-3 opacity-25" />
                        <p>No teachers found for this admin</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Department</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tenantData.teachers.map((teacher) => (
                              <tr key={teacher.id}>
                                <td className="fw-semibold">{teacher.name}</td>
                                <td>{teacher.email}</td>
                                <td>{teacher.department || '-'}</td>
                                <td>
                                  <span className={`badge ${teacher.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                    {teacher.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                                  >
                                    <Eye size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div>
                    {tenantData.courses.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <BookOpen size={48} className="mb-3 opacity-25" />
                        <p>No courses found for this admin</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Course Name</th>
                              <th>Course Code</th>
                              <th>Credit Hours</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tenantData.courses.map((course) => (
                              <tr key={course.id}>
                                <td className="fw-semibold">{course.course_name || course.name}</td>
                                <td>{course.course_code}</td>
                                <td>{course.credit_hours || '-'}</td>
                                <td>
                                  <span className={`badge ${course.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                    {course.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                  >
                                    <Eye size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <div className="card-body p-5 text-center">
            <Building2 size={64} className="text-muted mb-3 opacity-25" />
            <h5 className="text-muted mb-2">Select an Admin to View Data</h5>
            <p className="text-muted">Choose a tenant administrator from the dropdown to view and manage their data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
