import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, ChevronLeft, Download } from 'lucide-react';
import { reportService } from '../../api/reportService';
import toast from 'react-hot-toast';

const ReportCard = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [reportCard, setReportCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('Semester 1');

  useEffect(() => {
    if (studentId) {
      fetchReportCard();
    }
  }, [studentId, academicYear, semester]);

  const fetchReportCard = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReportCard(studentId, academicYear, semester);
      setReportCard(response);
    } catch (error) {
      console.error('Error fetching report card:', error);
      toast.error('Failed to load report card');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const blob = await reportService.exportReportCard(studentId, academicYear, semester);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_card_${studentId}_${academicYear}_${semester}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export started');
    } catch (error) {
      console.error('Error exporting report card:', error);
      toast.error('Export failed');
    }
  };

  const getAcademicStandingBadge = (standing) => {
    const standingMap = {
      "Dean's List": { class: 'bg-success', text: "Dean's List" },
      'Good Standing': { class: 'bg-info', text: 'Good Standing' },
      'Academic Probation': { class: 'bg-warning', text: 'Academic Probation' },
      'Academic Suspension': { class: 'bg-danger', text: 'Academic Suspension' }
    };
    const s = standingMap[standing] || { class: 'bg-secondary', text: standing || '-' };
    return <span className={`badge ${s.class} rounded-pill px-3`}>{s.text}</span>;
  };

  const getGradeBadge = (grade) => {
    const gradeMap = {
      'A+': 'bg-success',
      'A': 'bg-success',
      'B+': 'bg-info',
      'B': 'bg-info',
      'C+': 'bg-warning',
      'C': 'bg-warning',
      'D+': 'bg-secondary',
      'D': 'bg-secondary',
      'F': 'bg-danger'
    };
    const className = gradeMap[grade] || 'bg-secondary';
    return <span className={`badge ${className} rounded-pill px-3`}>{grade}</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!reportCard) {
    return (
      <div className="text-center py-5">
        <p>Report card data not found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/reports')}>
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={18} />
          <span>Back</span>
        </button>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-2"
            onClick={handlePrint}
          >
            <Printer size={18} />
            <span>Print</span>
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleExportPDF}
          >
            <Download size={18} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Academic Year and Semester Selectors */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Academic Year</label>
              <select
                className="form-select"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Semester</label>
              <select
                className="form-select"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="Semester 1">First Semester</option>
                <option value="Semester 2">Second Semester</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={fetchReportCard}>
                <i className="bi bi-arrow-repeat me-2"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Card Content */}
      <div className="card shadow-sm" id="report-card-content">
        <div className="card-body p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
            <div>
              <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 700 }}>
                GIC Career Gateway
              </h1>
              <p className="text-muted mb-0">Report Card / 成績通知表</p>
            </div>
            <div className="text-end">
              <p className="mb-0"><strong>Issue Date:</strong> {new Date(reportCard.generated_date || reportCard.generatedDate).toLocaleDateString()}</p>
              <p className="mb-0"><strong>Academic Year:</strong> {reportCard.academic_year || reportCard.academicYear}</p>
              <p className="mb-0"><strong>Semester:</strong> {reportCard.semester}</p>
            </div>
          </div>

          {/* Student Information */}
          <div className="bg-light p-3 rounded mb-4">
            <div className="row">
              <div className="col-md-4">
                <p className="mb-1"><strong>Student ID:</strong> {reportCard.student_id_number || reportCard.studentIdNumber}</p>
                <p className="mb-1"><strong>Name:</strong> {reportCard.student_name || reportCard.studentName}</p>
              </div>
              <div className="col-md-4">
                <p className="mb-1"><strong>Class:</strong> {reportCard.course_results?.[0]?.teacherName || 'N/A'}</p>
                <p className="mb-1"><strong>Class Rank:</strong> {reportCard.class_rank || reportCard.classRank} / {reportCard.total_students || reportCard.totalStudents}</p>
              </div>
              <div className="col-md-4">
                <p className="mb-1"><strong>Academic Status:</strong> {getAcademicStandingBadge(reportCard.academic_standing || reportCard.academicStanding)}</p>
              </div>
            </div>
          </div>

          {/* GPA Summary */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <h6 className="text-muted mb-1">Semester GPA</h6>
                <h2 className="mb-0 fw-bold text-primary">{reportCard.semester_gpa || reportCard.semesterGPA}</h2>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <h6 className="text-muted mb-1">Cumulative GPA</h6>
                <h2 className="mb-0 fw-bold text-primary">{reportCard.cumulative_gpa || reportCard.cumulativeGPA}</h2>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <h6 className="text-muted mb-1">Credits Earned</h6>
                <h2 className="mb-0 fw-bold text-success">{reportCard.total_credits || reportCard.totalCredits}</h2>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-light rounded">
                <h6 className="text-muted mb-1">Pass/Fail</h6>
                <h2 className="mb-0 fw-bold">{(reportCard.passed_courses || reportCard.passedCourses)} / {(reportCard.failed_courses || reportCard.failedCourses)}</h2>
              </div>
            </div>
          </div>

          {/* Course Results Table */}
          <h5 className="mb-3">
            <i className="bi bi-journal-bookmark-fill me-2 text-primary"></i>
            Grades by Subject
          </h5>
          <div className="table-responsive mb-4">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th className="text-center">Credits</th>
                  <th className="text-center">Average Score</th>
                  <th className="text-center">GPA</th>
                  <th className="text-center">Grade</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {(reportCard.course_results || reportCard.courseResults || []).map((course, idx) => (
                  <tr key={idx}>
                    <td>{course.course_code || course.courseCode}</td>
                    <td>{course.course_name || course.courseName}</td>
                    <td className="text-center">{course.credit_hours || course.creditHours}</td>
                    <td className="text-center">{course.average_score || course.averageScore}</td>
                    <td className="text-center">
                      <span className="badge bg-primary">{course.gpa}</span>
                    </td>
                    <td className="text-center">
                      {getGradeBadge(course.final_grade || course.finalGrade)}
                    </td>
                    <td>{course.teacher_name || course.teacherName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grading Scale */}
          <div className="row mb-4">
            <div className="col-md-6">
              <h6><i className="bi bi-info-circle me-2"></i>Grading Scale</h6>
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Grade</th>
                    <th>Percentage</th>
                    <th>GPA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>A+</td><td>90-100%</td><td>4.0</td></tr>
                  <tr><td>A</td><td>80-89%</td><td>4.0</td></tr>
                  <tr><td>B+</td><td>75-79%</td><td>3.5</td></tr>
                  <tr><td>B</td><td>70-74%</td><td>3.0</td></tr>
                  <tr><td>C+</td><td>65-69%</td><td>2.5</td></tr>
                  <tr><td>C</td><td>60-64%</td><td>2.0</td></tr>
                  <tr><td>D+</td><td>55-59%</td><td>1.5</td></tr>
                  <tr><td>D</td><td>50-54%</td><td>1.0</td></tr>
                  <tr><td>F</td><td>Below 50%</td><td>0.0</td></tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h6><i className="bi bi-chat-text me-2"></i>Remarks</h6>
              <div className="bg-light p-3 rounded mb-3">
                <p className="mb-2"><strong>Homeroom Teacher Comments:</strong></p>
                <p>{reportCard.class_teacher_remarks || reportCard.classTeacherRemarks || 'No remarks'}</p>
              </div>
              <div className="bg-light p-3 rounded">
                <p className="mb-2"><strong>Principal Comments:</strong></p>
                <p>{reportCard.principal_remarks || reportCard.principalRemarks || 'No remarks'}</p>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="row mt-5 pt-3">
            <div className="col-4 text-center">
              <div className="border-top mx-auto" style={{ width: '150px' }}></div>
              <p className="mb-0 mt-2">Homeroom Teacher</p>
            </div>
            <div className="col-4 text-center">
              <div className="border-top mx-auto" style={{ width: '150px' }}></div>
              <p className="mb-0 mt-2">Academic Director</p>
            </div>
            <div className="col-4 text-center">
              <div className="border-top mx-auto" style={{ width: '150px' }}></div>
              <p className="mb-0 mt-2">Principal</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-3 border-top">
            <p className="text-muted small mb-0">
              ※ This report card is an official record of GIC Career Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;