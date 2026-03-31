import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X, Mail, User, Building2, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { teacherService } from '../../api/teacherService';

const TeacherForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      name: '',
      email: '',
      department: '',
    }
  });

  const formValues = watch();

  useEffect(() => {
    if (isEditing) {
      fetchTeacher();
    }
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const response = await teacherService.getById(id);
      const teacher = response;
      setValue('name', teacher.name || '');
      setValue('email', teacher.email || '');
      setValue('department', teacher.department || '');
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast.error('Failed to load teacher data');
      navigate('/teachers');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await teacherService.update(id, data);
        toast.success('Teacher information updated successfully');
      } else {
        await teacherService.create(data);
        toast.success('Teacher added successfully');
      }
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/teachers');
      }, 1500);
    } catch (error) {
      console.error('Error saving teacher:', error);
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
        <p>Loading teacher data...</p>
      </div>
    );
  }

  return (
    <div className="teacher-form-module">
      {/* Header */}
      <div className="form-header">
        {/* <button className="back-button" onClick={() => navigate('/teachers')}>
          <ChevronLeft size={20} />
          <span>Back to Teachers</span>
        </button> */}
        <div className="form-title">
          <div className="title-icon">
            {isEditing ? <User size={28} /> : <User size={28} />}
          </div>
          <div>
            <h1>{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</h1>
            <p>{isEditing ? 'Update teacher information and status' : 'Create a new teacher profile in the system'}</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>{isEditing ? 'Teacher updated successfully!' : 'Teacher created successfully!'}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">👤</span>
              Personal Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''} ${formValues.name ? 'filled' : ''}`}
                    {...register('name', { required: 'Name is required' })}
                    placeholder="e.g., John Smith"
                  />
                </div>
                {errors.name && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.name.message}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''} ${formValues.email ? 'filled' : ''}`}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Enter a valid email address'
                      }
                    })}
                    placeholder="teacher@school.edu"
                  />
                </div>
                {errors.email && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.email.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Department
                </label>
                <div className="input-wrapper">
                  <Building2 size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.department ? 'filled' : ''}`}
                    {...register('department')}
                    placeholder="e.g., Computer Science, Mathematics"
                  />
                </div>
                <small className="helper-text">Optional - leave blank if not applicable</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Teacher ID
                </label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input disabled"
                    value={isEditing ? (id || 'Auto-generated') : 'Auto-generated after creation'}
                    disabled
                  />
                </div>
                <small className="helper-text">Teacher ID will be automatically generated</small>
              </div>
            </div>
          </div>

          {/* Information Card */}
          <div className="info-card">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>Important Notes</h4>
              <ul>
                <li>Teacher ID will be auto-generated (TCH001, TCH002, etc.)</li>
                <li>Email addresses must be unique in the system</li>
                <li>Deactivated teachers cannot be assigned to new courses</li>
                <li>You can activate/deactivate teachers from the list view</li>
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
                onClick={() => navigate('/teachers')}
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
                <span>{loading ? 'Saving...' : (isEditing ? 'Update Teacher' : 'Create Teacher')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .teacher-form-module {
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

        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
          margin-bottom: 1rem;
        }

        .back-button:hover {
          background: #f8fafc;
          border-color: #0f6cbd;
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

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.2s;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #0f6cbd;
          box-shadow: 0 0 0 3px rgba(15, 108, 189, 0.1);
        }

        .form-input.error {
          border-color: #dc2626;
        }

        .form-input.filled {
          border-color: #0f6cbd;
        }

        .form-input.disabled {
          background: #f8fafc;
          color: #64748b;
          cursor: not-allowed;
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

export default TeacherForm;