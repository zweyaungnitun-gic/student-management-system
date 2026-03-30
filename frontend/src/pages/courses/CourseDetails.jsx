import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit, Users, BookOpen, FileText, Award, Download, CheckCircle, XCircle } from 'lucide-react';
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

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseResponse = await courseService.getById(id);
      setCourse(courseResponse);
      
      // Fetch enrollments
      try {
        const enrollmentsResponse = await courseService.getEnrollments(id);
        setEnrollments(enrollmentsResponse || []);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setEnrollments([]);
      }
      
      // Fetch tests
      try {
        const testsResponse = await courseService.getTests(id);
        setTests(testsResponse || []);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setTests([]);
      }
      
      // Fetch statistics
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
      return date.toLocaleString();
    } catch (e) {
      return '-';
    }
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString();
    } catch (e) {
      return '-';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'enrolled': { class: 'bg-success', text: 'Enrolled' },
      'pending': { class: 'bg-warning', text: 'Pending' },
      'completed': { class: 'bg-info', text: 'Completed' },
      'dropped': { class: 'bg-danger', text: 'Dropped' },
      'failed': { class: 'bg-secondary', text: 'Failed' }
    };
    const s = statusMap[status] || { class: 'bg-secondary', text: status || 'Unknown' };
    return <span className={`badge ${s.class} rounded-pill px-3`}>{s.text}</span>;
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

  if (!course) {
    return (
      <div className="text-center py-5">
        <p>Course not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/courses')}>
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

  return (
    <div>
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Course Details
            </h1>
            <p className="text-muted mb-0">{courseCode} - {courseName}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mb-4">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => navigate('/courses')}
        >
          <ChevronLeft size={18} />
          <span>Back to List</span>
        </button>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => navigate(`/courses/${courseId}/edit`)}
        >
          <Edit size={18} />
          <span>Edit</span>
        </button>
        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={handleExport}
        >
          <Download size={18} />
          <span>Export Students</span>
        </button>
      </div>

      <div className="row">
        {/* Course Information Card */}
        <div className="col-md-5 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h5 className="card-title mb-0">
                <i className="bi bi-info-circle me-2 text-primary"></i>
                Course Information
              </h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th className="ps-0 text-muted" style={{ width: '120px' }}>ID</th>
                    <td className="fw-semibold">{courseId}</td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Course Code</th>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill">
                        {courseCode}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Course Name</th>
                    <td>{courseName}</td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Description</th>
                    <td>{course.description || '-'}</td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Credits</th>
                    <td>
                      <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 rounded-pill">
                        {creditHours} credits
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="ps-0 text-muted">Teacher</th>
                    <td>
                      {teacherName ? (
                        <span className="fw-semibold">{teacherName}</span>
                      ) : (
                        <span className="text-muted fst-italic">Unassigned</span>
                      )}
                    </td>
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
                    <td>{formatDate(createdAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="col-md-7 mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <StatCard
                icon={<Users size={28} className="text-primary" />}
                label="Enrolled Students"
                value={totalStudents}
                bgColor="primary"
              />
            </div>
            <div className="col-md-4">
              <StatCard
                icon={<CheckCircle size={28} className="text-success" />}
                label="Active Students"
                value={activeEnrollments}
                bgColor="success"
              />
            </div>
            <div className="col-md-4">
              <StatCard
                icon={<FileText size={28} className="text-info" />}
                label="Tests"
                value={tests.length}
                bgColor="info"
              />
            </div>
            <div className="col-md-4">
              <StatCard
                icon={<Award size={28} className="text-warning" />}
                label="Average Score"
                value={statistics.average_score || statistics.averageScore || '-'}
                bgColor="warning"
              />
            </div>
            <div className="col-md-4">
              <StatCard
                icon={<CheckCircle size={28} className="text-success" />}
                label="Pass Rate"
                value={statistics.pass_rate ? `${statistics.pass_rate}%` : '-'}
                bgColor="success"
              />
            </div>
            <div className="col-md-4">
              <StatCard
                icon={<BookOpen size={28} className="text-secondary" />}
                label="Total Credits"
                value={creditHours * tests.length || '-'}
                bgColor="secondary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Students Table */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-people me-2 text-success"></i>
            Enrolled Students
          </h5>
          <span className="badge bg-success rounded-pill">{enrollments.length} students</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Student ID</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Enrollment Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(enrollment => (
                  <tr key={enrollment.enrollment_id || enrollment.enrollmentId}>
                    <td className="ps-4">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                        {enrollment.student_id || enrollment.studentId}
                      </span>
                    </td>
                    <td>{enrollment.student_name || enrollment.studentName}</td>
                    <td>{getStatusBadge(enrollment.status)}</td>
                    <td>{formatDateShort(enrollment.enrollment_date || enrollment.enrollmentRequestDate)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-info me-1"
                        onClick={() => navigate(`/students/${enrollment.student_id || enrollment.studentId}`)}
                        title="Student Details"
                      >
                        <i className="bi bi-person"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => navigate(`/results/student/${enrollment.student_id || enrollment.studentId}`)}
                        title="Test Results"
                      >
                        <i className="bi bi-bar-chart"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {enrollments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      No students enrolled in this course
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-file-text me-2 text-info"></i>
            Course Tests
          </h5>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => navigate(`/tests/new?courseId=${courseId}`)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add Test
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Test Name</th>
                  <th>Total Marks</th>
                  <th>Passing Marks</th>
                  <th>Test Date</th>
                  <th>Created By</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => (
                  <tr key={test.test_id || test.testId}>
                    <td className="ps-4">{test.test_name || test.testName}</td>
                    <td>{test.total_marks || test.totalMarks}</td>
                    <td>{test.passing_marks || test.passingMarks || '-'}</td>
                    <td>{formatDateShort(test.test_date || test.testDate)}</td>
                    <td>{test.created_by_name || test.createdByName || 'System'}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => navigate(`/tests/${test.test_id || test.testId}`)}
                        title="Test Details"
                      >
                        <i className="bi bi-info-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => navigate(`/results/add?testId=${test.test_id || test.testId}`)}
                        title="Add Results"
                      >
                        <i className="bi bi-plus-circle"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {tests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      No tests created for this course yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;