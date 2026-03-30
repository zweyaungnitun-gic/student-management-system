// frontend/src/pages/teachers/TeacherDetails.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit, BookOpen, CheckCircle, Award, Info, Pencil, PlayCircle, PauseCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../../api/client';

const TeacherDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherDetails();
  }, [id]);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/teachers/${id}`);
      setTeacher(response.data);
      
      // Fetch courses for this teacher
      try {
        const coursesResponse = await client.get(`/courses/teacher/${id}`);
        setCourses(coursesResponse.data || []);
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

  const handleToggleActive = async () => {
    if (!teacher) return;
    try {
      const endpoint = teacher.is_active 
        ? `/teachers/deactivate/${teacher.teacher_id || teacher.teacherId}`
        : `/teachers/activate/${teacher.teacher_id || teacher.teacherId}`;
      await client.post(endpoint);
      toast.success(teacher.is_active ? 'Teacher deactivated' : 'Teacher activated');
      fetchTeacherDetails();
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!teacher) return;
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await client.delete(`/teachers/delete/${teacher.teacher_id || teacher.teacherId}`);
        toast.success(response.data?.message || 'Teacher deleted successfully');
        navigate('/teachers');
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString();
    } catch (e) {
      return '-';
    }
  };

  const StatCard = ({ icon, label, value, bgColor }) => (
    <div className={`card shadow-sm border-0 bg-${bgColor} bg-opacity-10`}>
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="flex-grow-1 ms-3">
            <h6 className="text-muted mb-1">{label}</h6>
            <h3 className="mb-0 fw-bold">{value}</h3>
          </div>
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

  if (!teacher) {
    return (
      <div className="text-center py-5">
        <p>Teacher not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/teachers')}>
          Back to Teacher List
        </button>
      </div>
    );
  }

  const teacherId = teacher.teacher_id || teacher.teacherId;
  const teacherCode = teacher.teacher_code || teacher.teacherCode;
  const isActive = teacher.is_active;
  const activeCourses = courses.filter(c => c.is_active).length;
  const totalCredits = courses.reduce((sum, c) => sum + (c.credit_hours || c.creditHours || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light btn-icon d-lg-none" type="button" data-sidebar-toggle>
            <i className="bi bi-list fs-4"></i>
          </button>
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Teacher Details
            </h1>
            <p className="text-muted mb-0">Teacher ID: {teacherCode}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => navigate('/teachers')}
        >
          <ChevronLeft size={18} />
          <span>Back to List</span>
        </button>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => navigate(`/teachers/${teacherId}/edit`)}
        >
          <Edit size={18} />
          <span>Edit</span>
        </button>
        {isActive ? (
          <button
            className="btn btn-warning d-flex align-items-center gap-2"
            onClick={handleToggleActive}
          >
            <PauseCircle size={18} />
            <span>Deactivate</span>
          </button>
        ) : (
          <button
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={handleToggleActive}
          >
            <PlayCircle size={18} />
            <span>Activate</span>
          </button>
        )}
        <button
          className="btn btn-danger d-flex align-items-center gap-2"
          onClick={handleDelete}
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
      </div>

      <div className="row">
        {/* Teacher Information Card */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">
                <i className="bi bi-person-badge me-2 text-primary"></i>
                Basic Information
              </h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th className="ps-0 text-muted" style={{ width: '120px' }}>Teacher ID</th>
                    <td className="fw-semibold">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                        {teacherCode}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Full Name</th>
                    <td>{teacher.name}</td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Email</th>
                    <td>{teacher.email}</td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Department</th>
                    <td>{teacher.department || '-'}</td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Status</th>
                    <td>
                      <span className={`badge rounded-pill px-3 ${isActive ? 'bg-success' : 'bg-danger'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Registered Date</th>
                    <td>{formatDate(teacher.created_at || teacher.createdAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Courses Card */}
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-book me-2 text-success"></i>
                Assigned Courses
              </h5>
              <span className="badge bg-success rounded-pill">{courses.length} items</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Course Code</th>
                      <th>Course Name</th>
                      <th>Credits</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.course_id || course.courseId}>
                        <td className="ps-4">
                          <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill">
                            {course.course_code || course.courseCode}
                          </span>
                        </td>
                        <td>{course.course_name || course.courseName}</td>
                        <td>
                          <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                            {course.credit_hours || course.creditHours} credits
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill px-3 ${(course.is_active !== undefined ? course.is_active : true) ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                            {(course.is_active !== undefined ? course.is_active : true) ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => navigate(`/courses/${course.course_id || course.courseId}`)}
                            title="Course Details"
                          >
                            <i className="bi bi-info-circle"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => navigate(`/tests/course/${course.course_id || course.courseId}`)}
                            title="Tests"
                          >
                            <i className="bi bi-file-text"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                          No courses assigned
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <StatCard
            icon={<BookOpen size={28} className="text-primary" />}
            label="Assigned Courses"
            value={courses.length}
            bgColor="primary"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            icon={<CheckCircle size={28} className="text-success" />}
            label="Active Courses"
            value={activeCourses}
            bgColor="success"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            icon={<Award size={28} className="text-info" />}
            label="Total Credits"
            value={totalCredits}
            bgColor="info"
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;