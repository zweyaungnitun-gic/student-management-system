import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X, BookOpen, Award, User, Building2, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { courseService } from '../../api/courseService';
import { teacherService } from '../../api/teacherService';

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [teachers, setTeachers] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      course_code: '',
      course_name: '',
      description: '',
      credit_hours: 3,
      teacher_id: '',
      is_active: true,
    }
  });

  const formValues = watch();
  const isActive = watch('is_active');

  useEffect(() => {
    fetchTeachers();
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll();
      setTeachers(response || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await courseService.getById(id);
      const course = response;
      setValue('course_code', course.course_code || course.courseCode || '');
      setValue('course_name', course.course_name || course.courseName || '');
      setValue('description', course.description || '');
      setValue('credit_hours', course.credit_hours || course.creditHours || 3);
      setValue('teacher_id', course.teacher_id || course.teacherId || '');
      setValue('is_active', course.is_active !== undefined ? course.is_active : true);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course data');
      navigate('/courses');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await courseService.update(id, data);
        toast.success('Course information updated successfully');
      } else {
        await courseService.create(data);
        toast.success('Course added successfully');
      }
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/courses');
      }, 1500);
    } catch (error) {
      console.error('Error saving course:', error);
      if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || 'Invalid data');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error(isEditing ? 'Update failed' : 'Add failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="form-loading">
        <div className="loading-spinner"></div>
        <p>Loading course data...</p>
      </div>
    );
  }

  return (
    <div className="course-form-module">
      {/* Header */}
      <div className="form-header">
        <div className="form-title">
          <div className="title-icon">
            <BookOpen size={28} />
          </div>
          <div>
            <h1>{isEditing ? 'Edit Course' : 'Add New Course'}</h1>
            <p>{isEditing ? 'Update course information and curriculum details' : 'Create a new course in the academic catalog'}</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>{isEditing ? 'Course updated successfully!' : 'Course created successfully!'}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📚</span>
              Course Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Course Code <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <BookOpen size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${errors.course_code ? 'error' : ''} ${formValues.course_code ? 'filled' : ''}`}
                    {...register('course_code', { 
                      required: 'Course code is required',
                      maxLength: { value: 20, message: 'Max 20 characters' }
                    })}
                    placeholder="e.g., JPN-N5, CS-101"
                  />
                </div>
                {errors.course_code && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.course_code.message}</span>
                  </div>
                )}
                <small className="helper-text">Unique identifier for the course</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Course Name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <FileText size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${errors.course_name ? 'error' : ''} ${formValues.course_name ? 'filled' : ''}`}
                    {...register('course_name', { 
                      required: 'Course name is required',
                      maxLength: { value: 200, message: 'Max 200 characters' }
                    })}
                    placeholder="e.g., Japanese N5, Introduction to Programming"
                  />
                </div>
                {errors.course_name && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.course_name.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">
                  Description
                </label>
                <div className="textarea-wrapper">
                  <textarea
                    className={`form-textarea ${errors.description ? 'error' : ''} ${formValues.description ? 'filled' : ''}`}
                    {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
                    rows="4"
                    placeholder="Enter course description, objectives, prerequisites, and learning outcomes..."
                  />
                </div>
                {errors.description && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.description.message}</span>
                  </div>
                )}
                <small className="helper-text">Optional - provide a detailed description of the course</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Credit Hours <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Award size={18} className="input-icon" />
                  <input
                    type="number"
                    className={`form-input ${errors.credit_hours ? 'error' : ''} ${formValues.credit_hours ? 'filled' : ''}`}
                    {...register('credit_hours', { 
                      required: 'Credit hours are required',
                      min: { value: 1, message: 'Minimum 1 credit' },
                      max: { value: 10, message: 'Maximum 10 credits' }
                    })}
                  />
                </div>
                {errors.credit_hours && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.credit_hours.message}</span>
                  </div>
                )}
                <small className="helper-text">Number of credits for this course (1-10)</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Assign Teacher
                </label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <select
                    className={`form-select ${errors.teacher_id ? 'error' : ''}`}
                    {...register('teacher_id')}
                  >
                    <option value="">-- Select a teacher --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.teacher_id || teacher.teacherId} value={teacher.teacher_id || teacher.teacherId}>
                        {teacher.name} {teacher.department ? `(${teacher.department})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <small className="helper-text">Optional - can be assigned later</small>
              </div>
            </div>

            {isEditing && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Status
                  </label>
                  <div className="status-toggle">
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="isActive"
                        {...register('is_active')}
                      />
                      <label htmlFor="isActive">
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </div>
                  </div>
                  <small className="helper-text">
                    {isActive 
                      ? 'Course is active and available for enrollment' 
                      : 'Course is inactive and hidden from enrollment lists'}
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Information Card */}
          <div className="info-card">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>Important Notes</h4>
              <ul>
                <li>Course code must be unique across the system</li>
                <li>Deactivating a course with enrolled students will hide it from active lists</li>
                <li>Teachers can be assigned or changed at any time</li>
                <li>Credit hours affect student GPA calculations</li>
                <li>Course descriptions help students understand prerequisites and content</li>
              </ul>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <div className="form-actions-left">
              <button
                type="button"
                className="btn-back"
                onClick={() => window.history.back()}
              >
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
            </div>
            <div className="form-actions-right">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/courses')}
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
                <span>{loading ? 'Saving...' : (isEditing ? 'Update Course' : 'Create Course')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .course-form-module {
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

        .form-row .full-width {
          grid-column: span 2;
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

        .input-wrapper, .textarea-wrapper {
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

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.2s;
          background: white;
        }

        .form-select {
          padding: 0.75rem 2rem 0.75rem 2.5rem;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
        }

        .form-textarea {
          padding: 0.75rem 1rem;
          resize: vertical;
          font-family: inherit;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #0f6cbd;
          box-shadow: 0 0 0 3px rgba(15, 108, 189, 0.1);
        }

        .form-input.error, .form-select.error, .form-textarea.error {
          border-color: #dc2626;
        }

        .form-input.filled, .form-select.filled, .form-textarea.filled {
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

        /* Status Toggle */
        .status-toggle {
          margin-top: 0.25rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }

        .toggle-switch label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .toggle-slider {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
          background-color: #cbd5e1;
          border-radius: 24px;
          transition: 0.3s;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        input:checked + label .toggle-slider {
          background-color: #0f6cbd;
        }

        input:checked + label .toggle-slider:before {
          transform: translateX(24px);
        }

        .toggle-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
        }

        /* Info Card */
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

        @media (max-width: 640px) {
          .form-actions {
            flex-direction: column;
          }
          
          .form-actions-left,
          .form-actions-right {
            width: 100%;
          }
          
          .btn-back, .btn-cancel, .btn-submit {
            flex: 1;
            justify-content: center;
          }
        }
`}</style>
    </div>
  );
};

export default CourseForm;