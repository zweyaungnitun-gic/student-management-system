import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X, FileText, BookOpen, Award, Calendar, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { testService } from '../../api/testService';
import { courseService } from '../../api/courseService';

const TestForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm({
    defaultValues: {
      test_name: '',
      course_id: '',
      total_marks: 100,
      passing_marks: 60,
      test_date: '',
      duration_minutes: 60,
      description: ''
    }
  });

  const formValues = watch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await courseService.getAll({ active_only: true });
        setCourses(coursesData || []);

        if (isEditing) {
          const test = await testService.getById(id);
          // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
          const formattedDate = test.test_date ? new Date(test.test_date).toISOString().slice(0, 16) : '';
          
          reset({
            test_name: test.test_name || '',
            course_id: test.course_id || '',
            total_marks: test.total_marks || 100,
            passing_marks: test.passing_marks || 60,
            test_date: formattedDate,
            duration_minutes: test.duration_minutes || 60,
            description: test.description || ''
          });
        }
      } catch (error) {
        console.error('Error fetching test data:', error);
        toast.error('Failed to load test data');
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
        ...data,
        course_id: parseInt(data.course_id),
        total_marks: parseFloat(data.total_marks),
        passing_marks: parseFloat(data.passing_marks),
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null
      };

      if (isEditing) {
        await testService.update(id, payload);
        toast.success('Test updated successfully');
      } else {
        await testService.create(payload);
        toast.success('Test created successfully');
      }
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/tests');
      }, 1500);
    } catch (error) {
      console.error('Error saving test:', error);
      toast.error(error.response?.data?.detail || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="form-loading">
        <div className="loading-spinner"></div>
        <p>Loading test data...</p>
      </div>
    );
  }

  return (
    <div className="test-form-module">
      {/* Header */}
      <div className="form-header">
        <div className="form-title">
          <div className="title-icon">
            <FileText size={28} />
          </div>
          <div>
            <h1>{isEditing ? 'Edit Test' : 'Create New Test'}</h1>
            <p>{isEditing ? 'Update test information and assessment details' : 'Create a new test or examination for a course'}</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>{isEditing ? 'Test updated successfully!' : 'Test created successfully!'}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              Test Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Test Name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <FileText size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${errors.test_name ? 'error' : ''} ${formValues.test_name ? 'filled' : ''}`}
                    {...register('test_name', { required: 'Test name is required' })}
                    placeholder="e.g., Midterm Exam, Final Exam, Quiz 1"
                  />
                </div>
                {errors.test_name && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.test_name.message}</span>
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
                    className={`form-select ${errors.course_id ? 'error' : ''}`}
                    {...register('course_id', { required: 'Please select a course' })}
                  >
                    <option value="">Select a course...</option>
                    {courses.map(course => (
                      <option key={course.course_id || course.courseId} value={course.course_id || course.courseId}>
                        {course.course_name || course.courseName} ({course.course_code || course.courseCode})
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
                  Total Marks <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Award size={18} className="input-icon" />
                  <input
                    type="number"
                    step="0.01"
                    className={`form-input ${errors.total_marks ? 'error' : ''} ${formValues.total_marks ? 'filled' : ''}`}
                    {...register('total_marks', { required: 'Total marks is required', min: 1 })}
                    placeholder="100"
                  />
                </div>
                {errors.total_marks && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.total_marks.message}</span>
                  </div>
                )}
                <small className="helper-text">Maximum score for this test</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Passing Marks
                </label>
                <div className="input-wrapper">
                  <CheckCircle size={18} className="input-icon" />
                  <input
                    type="number"
                    step="0.01"
                    className={`form-input ${formValues.passing_marks ? 'filled' : ''}`}
                    {...register('passing_marks', { min: 0 })}
                    placeholder="60"
                  />
                </div>
                <small className="helper-text">Minimum score required to pass (optional)</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Test Date & Time
                </label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="datetime-local"
                    className={`form-input ${formValues.test_date ? 'filled' : ''}`}
                    {...register('test_date')}
                  />
                </div>
                <small className="helper-text">When the test will take place</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Duration (Minutes)
                </label>
                <div className="input-wrapper">
                  <Clock size={18} className="input-icon" />
                  <input
                    type="number"
                    className={`form-input ${formValues.duration_minutes ? 'filled' : ''}`}
                    {...register('duration_minutes', { min: 1 })}
                    placeholder="60"
                  />
                </div>
                <small className="helper-text">Time limit for the test (optional)</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">
                  Description
                </label>
                <div className="textarea-wrapper">
                  <textarea
                    className={`form-textarea ${formValues.description ? 'filled' : ''}`}
                    {...register('description')}
                    rows="4"
                    placeholder="Enter test instructions, topics covered, or additional notes..."
                  />
                </div>
                <small className="helper-text">Optional - provide details about the test</small>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="info-card">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>Important Notes</h4>
              <ul>
                <li>Test results can be added after students complete the test</li>
                <li>Passing marks are used to determine pass/fail status automatically</li>
                <li>You can upload results in bulk after creating the test</li>
                <li>Test duration helps students know the time limit</li>
                <li>Tests can be edited even after results are added</li>
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
                onClick={() => navigate('/tests')}
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
                <span>{loading ? 'Saving...' : (isEditing ? 'Update Test' : 'Create Test')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .test-form-module {
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

        /* Form Actions */
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
          color: #475569;
        }

        .btn-back:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          transform: translateX(-2px);
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

        /* Responsive */
        @media (max-width: 768px) {
          .test-form-module {
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
          
          .form-row .full-width {
            grid-column: span 1;
          }
          
          .form-actions {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .form-actions-left,
          .form-actions-right {
            width: 100%;
          }
          
          .btn-back, 
          .btn-cancel, 
          .btn-submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default TestForm;