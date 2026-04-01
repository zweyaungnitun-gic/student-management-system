// frontend/src/pages/superadmin/SuperAdminDashboard.jsx

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
  ChevronDown,
  Shield,
  BarChart3,
  TrendingUp,
  Download
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
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      setCurrentPage(1);
      setSearchTerm('');
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
    setActiveTab('students');
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

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete "${username}"? This will also disable their access and all associated data.`)) {
      try {
        await userService.delete(userId);
        toast.success(`Tenant "${username}" deleted successfully`);
        fetchTenants();
        if (selectedTenant?.id === userId) {
          setSelectedTenant(null);
          setTenantData({ students: [], teachers: [], courses: [], enrollments: [] });
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const handleDownloadCSV = () => {
    try {
      let dataToExport = [];
      let filename = '';
      
      if (activeTab === 'students') {
        dataToExport = tenantData.students;
        filename = `${selectedTenant?.username}_students_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (activeTab === 'teachers') {
        dataToExport = tenantData.teachers;
        filename = `${selectedTenant?.username}_teachers_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (activeTab === 'courses') {
        dataToExport = tenantData.courses;
        filename = `${selectedTenant?.username}_courses_${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      if (dataToExport.length === 0) {
        toast.error(`No ${activeTab} data to export`);
        return;
      }
      
      let headers = [];
      let rows = [];
      
      if (activeTab === 'students') {
        headers = ['Student ID', 'Name', 'Email', 'Gender', 'Phone', 'National ID', 'Status', 'Enrolled Date'];
        rows = dataToExport.map(s => [
          `"${s.student_id || ''}"`,
          `"${s.student_name || ''}"`,
          `"${s.email || ''}"`,
          `"${s.gender || ''}"`,
          `"${s.phone_number || ''}"`,
          `"${s.national_id || ''}"`,
          `"${s.registration_status || ''}"`,
          `"${s.enrolled_date || ''}"`
        ]);
      } else if (activeTab === 'teachers') {
        headers = ['Teacher ID', 'Name', 'Email', 'Department', 'Status', 'Created Date'];
        rows = dataToExport.map(t => [
          `"${t.teacher_code || t.teacherCode || ''}"`,
          `"${t.name || ''}"`,
          `"${t.email || ''}"`,
          `"${t.department || ''}"`,
          `"${t.is_active ? 'Active' : 'Inactive'}"`,
          `"${t.created_at || t.createdAt || ''}"`
        ]);
      } else if (activeTab === 'courses') {
        headers = ['Course ID', 'Course Code', 'Course Name', 'Credits', 'Teacher', 'Status', 'Created Date'];
        rows = dataToExport.map(c => [
          `"${c.course_id || c.courseId || ''}"`,
          `"${c.course_code || c.courseCode || ''}"`,
          `"${(c.course_name || c.courseName || '').replace(/"/g, '""')}"`,
          `"${c.credit_hours || c.creditHours || ''}"`,
          `"${c.teacher_name || c.teacherName || 'Unassigned'}"`,
          `"${c.is_active ? 'Active' : 'Inactive'}"`,
          `"${c.created_at || c.createdAt || ''}"`
        ]);
      }
      
      const csvRows = [headers.join(','), ...rows.map(row => row.join(','))];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${dataToExport.length} ${activeTab}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const filteredData = () => {
    let data = [];
    if (activeTab === 'students') data = tenantData.students;
    else if (activeTab === 'teachers') data = tenantData.teachers;
    else if (activeTab === 'courses') data = tenantData.courses;
    
    if (!searchTerm) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      if (activeTab === 'students') {
        return item.student_name?.toLowerCase().includes(searchLower) ||
               item.student_id?.toLowerCase().includes(searchLower) ||
               item.email?.toLowerCase().includes(searchLower);
      } else if (activeTab === 'teachers') {
        return item.name?.toLowerCase().includes(searchLower) ||
               item.email?.toLowerCase().includes(searchLower) ||
               (item.teacher_code || item.teacherCode)?.toLowerCase().includes(searchLower);
      } else if (activeTab === 'courses') {
        return (item.course_name || item.courseName)?.toLowerCase().includes(searchLower) ||
               (item.course_code || item.courseCode)?.toLowerCase().includes(searchLower);
      }
      return true;
    });
  };

  // Pagination
  const filteredItems = filteredData();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <span className="status-badge success"><span className="status-dot"></span>Active</span>;
    }
    return <span className="status-badge danger"><span className="status-dot"></span>Inactive</span>;
  };

  const getRoleBadge = (role) => {
    if (role === 'SUPER_ADMIN') {
      return <span className="role-badge super-admin"><Shield size={12} /> Super Admin</span>;
    }
    return <span className="role-badge admin"><Building2 size={12} /> Admin</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '-';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Statistics
  const totalStudents = tenantData.students.length;
  const totalTeachers = tenantData.teachers.length;
  const totalCourses = tenantData.courses.length;
  const totalTenants = tenants.length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading super admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="super-admin-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <Shield size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Super Admin Dashboard</h1>
            <p className="header-subtitle">Manage all tenant administrators and monitor system-wide data</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalTenants}</h3>
            <p>Total Tenants</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <GraduationCap size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalTeachers}</h3>
            <p>Total Teachers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>
      </div>

      {/* Tenant Selector Section */}
      <div className="tenant-selector-section">
        <div className="selector-header">
          <h3 className="section-title">
            <Building2 size={20} />
            <span>Tenant Administrators</span>
          </h3>
          <button
            className="btn-add-tenant"
            onClick={() => navigate('/users/new')}
          >
            <Plus size={16} />
            <span>Add Tenant Admin</span>
          </button>
        </div>
        
        <div className="tenants-grid">
          {tenants.length === 0 ? (
            <div className="empty-tenants">
              <Building2 size={48} className="empty-icon" />
              <p>No tenant administrators found</p>
              <button className="btn-add-primary" onClick={() => navigate('/users/new')}>
                <Plus size={16} />
                <span>Add Your First Tenant</span>
              </button>
            </div>
          ) : (
            tenants.map(tenant => (
              <div 
                key={tenant.id} 
                className={`tenant-card ${selectedTenant?.id === tenant.id ? 'selected' : ''}`}
                onClick={() => handleTenantSelect(tenant)}
              >
                <div className="tenant-avatar">
                  {getInitials(tenant.username)}
                </div>
                <div className="tenant-info">
                  <div className="tenant-name">{tenant.username}</div>
                  <div className="tenant-email">{tenant.email}</div>
                  <div className="tenant-school">{tenant.school_name || tenant.schoolName || 'No school'}</div>
                </div>
                <div className="tenant-actions">
                  {getRoleBadge(tenant.role)}
                  <button 
                    className="icon-btn edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/users/${tenant.id}/edit`);
                    }}
                    title="Edit Tenant"
                  >
                    <Pencil size={14} />
                  </button>
                  <button 
                    className="icon-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(tenant.id, tenant.username);
                    }}
                    title="Delete Tenant"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Tenant Data Section */}
      {selectedTenant ? (
        <div className="tenant-data-section">
          <div className="data-header">
            <div className="data-title">
              <Building2 size={20} />
              <h3>Data Overview: {selectedTenant.username}</h3>
            </div>
            <div className="data-actions">
              <button className="btn-download" onClick={handleDownloadCSV}>
                <Download size={16} />
                <span>Export {activeTab}</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button 
              className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('students');
                setCurrentPage(1);
                setSearchTerm('');
              }}
            >
              <GraduationCap size={16} />
              <span>Students</span>
              <span className="tab-count">{tenantData.students.length}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('teachers');
                setCurrentPage(1);
                setSearchTerm('');
              }}
            >
              <Users size={16} />
              <span>Teachers</span>
              <span className="tab-count">{tenantData.teachers.length}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('courses');
                setCurrentPage(1);
                setSearchTerm('');
              }}
            >
              <BookOpen size={16} />
              <span>Courses</span>
              <span className="tab-count">{tenantData.courses.length}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Data Table */}
          {dataLoading ? (
            <div className="loading-container-small">
              <div className="spinner-small"></div>
              <p>Loading data...</p>
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="empty-data">
              <div className="empty-icon">📊</div>
              <p>No {activeTab} found for this tenant</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                {activeTab === 'students' && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Enrolled Date</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map(student => (
                        <tr key={student.id}>
                          <td className="student-id-cell">{student.student_id}</td>
                          <td className="student-name-cell">
                            <div className="student-info">
                              <div className="student-avatar">
                                {getInitials(student.student_name)}
                              </div>
                              <span>{student.student_name}</span>
                            </div>
                          </td>
                          <td>{student.email || '-'}</td>
                          <td>{student.phone_number || '-'}</td>
                          <td>
                            <span className={`status-badge ${student.registration_status === 'ENROLLED' || student.registration_status === 'ACCEPTED' ? 'success' : 'warning'}`}>
                              {student.registration_status || 'PENDING'}
                            </span>
                          </td>
                          <td>{formatDate(student.enrolled_date)}</td>
                          <td className="text-center">
                            <button 
                              className="icon-btn view"
                              onClick={() => navigate(`/students/${student.id}`)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'teachers' && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Teacher ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map(teacher => (
                        <tr key={teacher.teacher_id || teacher.teacherId}>
                          <td className="teacher-id-cell">{teacher.teacher_code || teacher.teacherCode}</td>
                          <td className="teacher-name-cell">
                            <div className="teacher-info">
                              <div className="teacher-avatar">
                                {getInitials(teacher.name)}
                              </div>
                              <span>{teacher.name}</span>
                            </div>
                          </td>
                          <td>{teacher.email}</td>
                          <td>{teacher.department || '-'}</td>
                          <td>{getStatusBadge(teacher.is_active)}</td>
                          <td>{formatDate(teacher.created_at || teacher.createdAt)}</td>
                          <td className="text-center">
                            <button 
                              className="icon-btn view"
                              onClick={() => navigate(`/teachers/${teacher.teacher_id || teacher.teacherId}`)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'courses' && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Teacher</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map(course => (
                        <tr key={course.course_id || course.courseId}>
                          <td className="course-code-cell">{course.course_code || course.courseCode}</td>
                          <td className="course-name-cell">
                            <div className="course-info">
                              <div className="course-avatar">
                                {getInitials(course.course_name || course.courseName)}
                              </div>
                              <span>{course.course_name || course.courseName}</span>
                            </div>
                          </td>
                          <td>{course.credit_hours || course.creditHours || '-'}</td>
                          <td>{course.teacher_name || course.teacherName || 'Unassigned'}</td>
                          <td>{getStatusBadge(course.is_active)}</td>
                          <td>{formatDate(course.created_at || course.createdAt)}</td>
                          <td className="text-center">
                            <button 
                              className="icon-btn view"
                              onClick={() => navigate(`/courses/${course.course_id || course.courseId}`)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronDown size={18} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                  <div className="page-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                </div>
              )}
              
              <div className="table-footer">
                <span className="showing-info">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} {activeTab}
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="no-selection">
          <Building2 size={64} className="empty-icon" />
          <h3>Select a Tenant Administrator</h3>
          <p>Choose a tenant from the list above to view and manage their data</p>
        </div>
      )}

      <style>{`
        .super-admin-module {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .module-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          flex: 1;
          min-width: 150px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }
        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.orange { background: #fff3e0; color: #ed6c02; }

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

        .tenant-selector-section {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid #eef2ff;
        }

        .selector-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .btn-add-tenant {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-tenant:hover {
          background: #0a58a0;
          transform: translateY(-1px);
        }

        .tenants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }

        .tenant-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }

        .tenant-card:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
        }

        .tenant-card.selected {
          background: #e3f2fd;
          border-color: #0f6cbd;
        }

        .tenant-avatar {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .tenant-info {
          flex: 1;
        }

        .tenant-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .tenant-email {
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .tenant-school {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .tenant-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .role-badge.super-admin {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .role-badge.admin {
          background: #e3f2fd;
          color: #1976d2;
        }

        .tenant-data-section {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid #eef2ff;
        }

        .data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .data-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .data-title h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .btn-download {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #0f6cbd;
          color: #0f6cbd;
          border-radius: 10px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-download:hover {
          background: #e3f2fd;
        }

        .tabs-container {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #eef2ff;
          margin-bottom: 1rem;
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

        .search-bar {
          margin-bottom: 1rem;
        }

        .search-wrapper {
          max-width: 350px;
        }

        .search-input {
          width: 100%;
          padding: 0.6rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #0f6cbd;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 0.75rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.8rem;
        }

        .data-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          font-size: 0.85rem;
        }

        .data-table tr:hover {
          background: #f8fafc;
        }

        .student-info, .teacher-info, .course-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .student-avatar, .teacher-avatar, .course-avatar {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.7rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .status-badge.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.danger {
          background: #ffebee;
          color: #c62828;
        }

        .status-badge.warning {
          background: #fff3e0;
          color: #ed6c02;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .icon-btn {
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .icon-btn.view { color: #0f6cbd; }
        .icon-btn.view:hover { background: #e3f2fd; }
        .icon-btn.edit { color: #f59e0b; }
        .icon-btn.edit:hover { background: #fef3c7; }
        .icon-btn.delete { color: #dc2626; }
        .icon-btn.delete:hover { background: #fee2e2; }

        .text-center {
          text-align: center;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .page-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-btn:not(:disabled):hover {
          background: #f1f5f9;
          border-color: #0f6cbd;
        }

        .page-info {
          font-size: 0.8rem;
          color: #64748b;
        }

        .table-footer {
          margin-top: 1rem;
          text-align: center;
        }

        .showing-info {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .empty-tenants, .empty-data, .no-selection {
          text-align: center;
          padding: 3rem;
        }

        .empty-icon {
          color: #cbd5e1;
          margin-bottom: 1rem;
        }

        .btn-add-primary {
          padding: 0.5rem 1rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-container-small {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 0.5rem;
        }

        .spinner, .spinner-small {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0f6cbd;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-small {
          width: 24px;
          height: 24px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .super-admin-module {
            padding: 1rem;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .tenants-grid {
            grid-template-columns: 1fr;
          }
          
          .tabs-container {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;