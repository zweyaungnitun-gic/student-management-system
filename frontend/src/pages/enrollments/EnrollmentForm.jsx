import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X, Users, BookOpen, Calendar, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../api/enrollmentService';
import { studentService } from '../../api/studentService';
import { courseService } from '../../api/courseService';

const EnrollmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      student_id: '',
      course_id: '',
      semester: '',
      status: 'pending'
    }
  });

  const formValues = watch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, coursesData] = await Promise.all([
          studentService.getAll(),
          courseService.getAll()
        ]);
        setStudents(studentsData);
        setCourses(coursesData);

        if (isEditing) {
          const enrollment = await enrollmentService.getById(id);
          reset({
            student_id: enrollment.student_id,
            course_id: enrollment.course_id,
            semester: enrollment.semester,
            status: enrollment.status
          });
        }
      } catch (error) {
        console.error('Error fetching enrollment data:', error);
        toast.error('Failed to load enrollment data');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        student_id: parseInt(data.student_id),
        course_id: parseInt(data.course_id),
        semester: data.semester,
        status: data.status || 'pending'
      };

      if (isEditing) {
        await enrollmentService.updateStatus(id, payload.status);
        toast.success('Enrollment status updated successfully');
      } else {
        await enrollmentService.create(payload);
        toast.success('Enrollment created successfully');
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/enrollments');
      }, 1500);
    } catch (error) {
      console.error('Error saving enrollment:', error);
      toast.error(error.response?.data?.detail || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="form-loading">
        <div className="loading-spinner"></div>
        <p>Loading enrollment data...</p>
      </div>
    );
  }

  return (
    <div className="enrollment-form-module">
      {/* Header */}
      <div className="form-header">
        <div className="form-title">
          <div className="title-icon">
            <Users size={28} />
          </div>
          <div>
            <h1>{isEditing ? 'Edit Enrollment' : 'New Enrollment'}</h1>
            <p>{isEditing ? 'Update enrollment status and details' : 'Register a student for a course'}</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>{isEditing ? 'Enrollment updated successfully!' : 'Enrollment created successfully!'}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📋</span>
              Enrollment Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Student <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Users size={18} className="input-icon" />
                  <select 
                    className={`form-select ${errors.student_id ? 'error' : ''} ${formValues.student_id ? 'filled' : ''}`}
                    {...register('student_id', { required: 'Please select a student' })}
                    disabled={isEditing}
                  >
                    <option value="">Select a student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.student_name} ({s.student_id})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.student_id && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.student_id.message}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Course <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <BookOpen size={18} className="input-icon" />
                  <select 
                    className={`form-select ${errors.course_id ? 'error' : ''} ${formValues.course_id ? 'filled' : ''}`}
                    {...register('course_id', { required: 'Please select a course' })}
                    disabled={isEditing}
                  >
                    <option value="">Select a course...</option>
                    {courses.map(c => (
                      <option key={c.course_id || c.courseId} value={c.course_id || c.courseId}>
                        {c.course_name || c.courseName} ({c.course_code || c.courseCode})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.course_id && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.course_id.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Semester <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon" />
                  <input 
                    type="text" 
                    className={`form-input ${errors.semester ? 'error' : ''} ${formValues.semester ? 'filled' : ''}`}
                    {...register('semester', { required: 'Semester is required' })}
                    placeholder="e.g., 2024-S1, Fall 2024"
                  />
                </div>
                {errors.semester && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.semester.message}</span>
                  </div>
                )}
                <small className="helper-text">e.g., 2024-S1 (First Semester 2024)</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Status
                </label>
                <div className="input-wrapper">
                  <Info size={18} className="input-icon" />
                  <select 
                    className="form-select"
                    {...register('status')}
                  >
                    <option value="pending">Pending</option>
                    <option value="enrolled">Enrolled</option>
                    <option value="completed">Completed</option>
                    <option value="dropped">Dropped</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <small className="helper-text">Enrollment status determines student access</small>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="info-card">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>Important Notes</h4>
              <ul>
                <li>Student and course cannot be changed after enrollment is created</li>
                <li>Pending enrollments require admin approval before access is granted</li>
                <li>Completed enrollments are archived for historical records</li>
                <li>Dropped enrollments remove student access to course materials</li>
                <li>Failed enrollments indicate the student did not meet passing requirements</li>
              </ul>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <div className="form-actions-left">
              <button
                type="button"
                className="btn-back"
                onClick={() => navigate(-1)}
              >
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
            </div>
            <div className="form-actions-right">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/enrollments')}
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                <Save size={18} />
                <span>{loading ? 'Saving...' : (isEditing ? 'Update Enrollment' : 'Create Enrollment')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .enrollment-form-module {
          padding: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .form-loading {
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

        .form-header {
          margin-bottom: 2rem;
        }

        .form-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .title-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .form-title h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: #0f172a;
        }

        .form-title p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .success-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          animation: slideIn 0.3s ease;
          z-index: 1000;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .form-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #eef2ff;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-icon {
          font-size: 1.2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 500;
          color: #334155;
          font-size: 0.85rem;
        }

        .required {
          color: #dc2626;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
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

        .form-input.error, .form-select.error {
          border-color: #dc2626;
        }

        .form-input.filled, .form-select.filled {
          border-color: #0f6cbd;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #dc2626;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .helper-text {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.25rem;
        }

        .info-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .info-icon {
          font-size: 1.5rem;
        }

        .info-content h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
        }

        .info-content ul {
          margin: 0;
          padding-left: 1.25rem;
        }

        .info-content li {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.25rem;
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eef2ff;
          margin-top: 1rem;
        }

        .form-actions-left,
        .form-actions-right {
          display: flex;
          gap: 0.75rem;
        }

        .btn-back {
          padding: 0.75rem 1.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-back:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          color: #dc2626;
        }

        .btn-cancel:hover {
          background: #fef2f2;
          border-color: #dc2626;
        }

        .btn-submit {
          padding: 0.75rem 1.5rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .btn-submit:hover:not(:disabled) {
          background: #0a58a0;
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .enrollment-form-module {
            padding: 1rem;
          }
          
          .form-card {
            padding: 1.5rem;
          }
          
          .form-title {
            flex-direction: column;
            text-align: center;
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .form-actions-left,
          .form-actions-right {
            width: 100%;
          }
          
          .btn-back, .btn-cancel, .btn-submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EnrollmentForm;