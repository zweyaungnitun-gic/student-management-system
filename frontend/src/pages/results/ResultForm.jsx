import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Save, X, Award, User, BookOpen, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { resultService } from '../../api/resultService';
import { testService } from '../../api/testService';
import { studentService } from '../../api/studentService';

const ResultForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const queryParams = new URLSearchParams(location.search);
  const defaultTestId = queryParams.get('testId');

  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      test_id: defaultTestId || '',
      student_id: '',
      marks_obtained: '',
      remarks: ''
    }
  });

  const formValues = watch();
  const selectedTestId = watch('test_id');

  useEffect(() => {
    if (selectedTestId) {
      const test = tests.find(t => (t.test_id || t.id) === parseInt(selectedTestId));
      setSelectedTest(test);
    } else {
      setSelectedTest(null);
    }
  }, [selectedTestId, tests]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, studentsData] = await Promise.all([
          testService.getAll(),
          studentService.getAll()
        ]);
        setTests(testsData);
        setStudents(studentsData);

        if (isEditing) {
          const result = await resultService.getById(id);
          reset({
            test_id: result.test_id,
            student_id: result.student_id,
            marks_obtained: result.marks_obtained,
            remarks: result.remarks
          });
        }
      } catch (error) {
        console.error('Error fetching result data:', error);
        toast.error('データの取得に失敗しました');
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
        test_id: parseInt(data.test_id),
        student_id: parseInt(data.student_id),
        marks_obtained: parseFloat(data.marks_obtained),
        remarks: data.remarks
      };

      if (isEditing) {
        await resultService.update(id, payload);
        toast.success('成績を更新しました');
      } else {
        await resultService.create(payload);
        toast.success('成績を記録しました');
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate(payload.test_id ? `/results?testId=${payload.test_id}` : '/results');
      }, 1500);
    } catch (error) {
      console.error('Error saving result:', error);
      toast.error(error.response?.data?.detail || '保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getMaxScore = () => {
    if (selectedTest) {
      return selectedTest.total_marks || selectedTest.totalMarks;
    }
    return null;
  };

  if (initialLoading) {
    return (
      <div className="form-loading">
        <div className="loading-spinner"></div>
        <p>Loading result data...</p>
      </div>
    );
  }

  return (
    <div className="result-form-module">
      {/* Header */}
      <div className="form-header">
        <div className="form-title">
          <div className="title-icon">
            <Award size={28} />
          </div>
          <div>
            <h1>{isEditing ? 'Edit Result' : 'Enter Result'}</h1>
            <p>{isEditing ? 'Update student test score and feedback' : 'Record student examination scores and performance'}</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>{isEditing ? 'Result updated successfully!' : 'Result recorded successfully!'}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              Result Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Test <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <BookOpen size={18} className="input-icon" />
                  <select 
                    className={`form-select ${errors.test_id ? 'error' : ''} ${formValues.test_id ? 'filled' : ''}`}
                    {...register('test_id', { required: 'Please select a test' })}
                    disabled={isEditing}
                  >
                    <option value="">Select a test...</option>
                    {tests.map(t => (
                      <option key={t.test_id || t.id} value={t.test_id || t.id}>
                        {t.test_name || t.testName} ({t.course_name || t.courseName})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.test_id && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.test_id.message}</span>
                  </div>
                )}
                {selectedTest && (
                  <small className="helper-text">
                    Max Score: {getMaxScore()} | Passing: {selectedTest.passing_marks || selectedTest.passingMarks || 'Not set'}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Student <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Score Obtained <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Award size={18} className="input-icon" />
                  <input 
                    type="number" 
                    step="0.01"
                    className={`form-input ${errors.marks_obtained ? 'error' : ''} ${formValues.marks_obtained ? 'filled' : ''}`}
                    {...register('marks_obtained', { 
                      required: 'Score is required', 
                      valueAsNumber: true,
                      min: { value: 0, message: 'Score cannot be negative' },
                      max: { value: getMaxScore() || 100, message: `Score cannot exceed ${getMaxScore() || 100}` }
                    })}
                    placeholder="e.g., 85"
                  />
                </div>
                {errors.marks_obtained && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.marks_obtained.message}</span>
                  </div>
                )}
                {selectedTest && formValues.marks_obtained && (
                  <small className="helper-text">
                    Percentage: {((formValues.marks_obtained / getMaxScore()) * 100).toFixed(1)}%
                  </small>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Grade / Result
                </label>
                <div className="result-preview">
                  {formValues.marks_obtained && selectedTest && (
                    <div className={`grade-preview ${getGradeFromScore(formValues.marks_obtained, getMaxScore())}`}>
                      {getGradeFromScore(formValues.marks_obtained, getMaxScore())}
                    </div>
                  )}
                </div>
                <small className="helper-text">
                  Grade will be automatically calculated based on score
                </small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">
                  Teacher Remarks
                </label>
                <div className="textarea-wrapper">
                  <textarea 
                    className={`form-textarea ${formValues.remarks ? 'filled' : ''}`}
                    rows="4"
                    {...register('remarks')}
                    placeholder="Enter feedback or additional notes about student performance..."
                  />
                </div>
                <small className="helper-text">
                  Optional - Add comments about the student's performance
                </small>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="info-card">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>Important Notes</h4>
              <ul>
                <li>Test and student selection cannot be changed after creation</li>
                <li>Grade will be automatically calculated based on the test's passing criteria</li>
                <li>GPA is calculated automatically from the score percentage</li>
                <li>Teacher remarks help track student progress over time</li>
                <li>You can bulk upload results using the CSV import feature</li>
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
                onClick={() => navigate('/results')}
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
                <span>{loading ? 'Saving...' : (isEditing ? 'Update Result' : 'Save Result')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .result-form-module {
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

        .result-preview {
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 12px;
          text-align: center;
        }

        .grade-preview {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          border-radius: 20px;
          font-size: 1rem;
          font-weight: 700;
        }

        .grade-preview.A, .grade-preview.A+ {
          background: #e8f5e9;
          color: #2e7d32;
        }
        .grade-preview.B, .grade-preview.B+ {
          background: #e3f2fd;
          color: #1976d2;
        }
        .grade-preview.C, .grade-preview.C+ {
          background: #fff3e0;
          color: #ed6c02;
        }
        .grade-preview.D, .grade-preview.D+ {
          background: #f3e5f5;
          color: #7b1fa2;
        }
        .grade-preview.F {
          background: #ffebee;
          color: #c62828;
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
          .result-form-module {
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

// Helper function to calculate grade
const getGradeFromScore = (score, maxScore) => {
  if (!maxScore) return '-';
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 30) return 'D+';
  if (percentage >= 20) return 'D';
  return 'F';
};

export default ResultForm;