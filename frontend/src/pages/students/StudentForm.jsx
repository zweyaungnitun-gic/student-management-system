import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X, User, Calendar, Phone, Mail, MapPin, Globe, BookOpen, Briefcase, UserCircle, FileText, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { studentService } from '../../api/studentService';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      student_name: '',
      national_id: '',
      date_of_birth: '',
      gender: '',
      email: '',
      phone_number: '',
      current_living_address: '',
      home_town_address: '',
      registration_status: 'ACCEPTED',
      // Additional Info
      name_in_japanese: '',
      passport_number: '',
      passed_highest_jlpt_level: '',
      desired_job_type: '',
      father_name: '',
      contact_viber: '',
      religion: '',
      is_smoking: false,
      is_alcohol_drink: false,
      have_tatto: false,
      hostel_preference: false,
    }
  });

  const formValues = watch();

  useEffect(() => {
    if (isEditing) {
      const loadStudent = async () => {
        try {
          const data = await studentService.getById(id);
          reset({
            student_name: data.student_name,
            national_id: data.national_id,
            date_of_birth: data.date_of_birth,
            gender: data.gender,
            email: data.email,
            phone_number: data.phone_number,
            current_living_address: data.current_living_address,
            home_town_address: data.home_town_address,
            registration_status: data.registration_status,
            // Additional Info
            name_in_japanese: data.additional_info?.name_in_japanese || '',
            passport_number: data.additional_info?.passport_number || '',
            passed_highest_jlpt_level: data.additional_info?.passed_highest_jlpt_level || '',
            desired_job_type: data.additional_info?.desired_job_type || '',
            father_name: data.additional_info?.father_name || '',
            contact_viber: data.additional_info?.contact_viber || '',
            religion: data.religion || '',
            is_smoking: data.additional_info?.is_smoking || false,
            is_alcohol_drink: data.additional_info?.is_alcohol_drink || false,
            have_tatto: data.additional_info?.have_tatto || false,
            hostel_preference: data.additional_info?.hostel_preference || false,
          });
        } catch (error) {
          toast.error('Failed to load student data');
          navigate('/students');
        } finally {
          setFetching(false);
        }
      };
      loadStudent();
    }
  }, [id, isEditing, reset, navigate]);

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const {
        name_in_japanese,
        passport_number,
        passed_highest_jlpt_level,
        desired_job_type,
        father_name,
        contact_viber,
        religion,
        is_smoking,
        is_alcohol_drink,
        have_tatto,
        hostel_preference,
        ...coreData
      } = formData;

      const payload = {
        ...coreData,
        additional_info: {
          name_in_japanese,
          passport_number,
          passed_highest_jlpt_level,
          desired_job_type,
          father_name,
          contact_viber,
          is_smoking,
          is_alcohol_drink,
          have_tatto,
          hostel_preference
        },
        religion
      };

      if (isEditing) {
        await studentService.update(id, payload);
        toast.success('Student updated successfully!');
      } else {
        await studentService.create(payload);
        toast.success('Student registered successfully!');
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/students');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred during submission.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="form-loading">
        <div className="loading-spinner"></div>
        <p>Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="student-form-module">
      {/* Header */}
      <div className="form-header">
        <div className="form-title">
          <div className="title-icon">
            <User size={28} />
          </div>
          <div>
            <h1>{isEditing ? 'Edit Student' : 'New Student Registration'}</h1>
            <p>{isEditing ? 'Update student information and records' : 'Register a new student into the system'}</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast">
          <CheckCircle size={20} />
          <span>{isEditing ? 'Student updated successfully!' : 'Student registered successfully!'}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information Section */}
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
                    className={`form-input ${errors.student_name ? 'error' : ''} ${formValues.student_name ? 'filled' : ''}`}
                    {...register('student_name', { required: 'Full name is required' })}
                    placeholder="Enter full name"
                  />
                </div>
                {errors.student_name && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.student_name.message}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  National ID <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <FileText size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${errors.national_id ? 'error' : ''} ${formValues.national_id ? 'filled' : ''}`}
                    {...register('national_id', { required: 'National ID is required' })}
                    placeholder="e.g., 12/ABC(N)123456"
                  />
                </div>
                {errors.national_id && (
                  <div className="error-message">
                    <AlertCircle size={14} />
                    <span>{errors.national_id.message}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    className={`form-input ${formValues.date_of_birth ? 'filled' : ''}`}
                    {...register('date_of_birth')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <div className="input-wrapper">
                  <UserCircle size={18} className="input-icon" />
                  <select
                    className={`form-select ${formValues.gender ? 'filled' : ''}`}
                    {...register('gender')}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📞</span>
              Contact Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className={`form-input ${formValues.email ? 'filled' : ''}`}
                    {...register('email')}
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="tel"
                    className={`form-input ${formValues.phone_number ? 'filled' : ''}`}
                    {...register('phone_number')}
                    placeholder="e.g., +959123456789"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Address</label>
                <div className="input-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.current_living_address ? 'filled' : ''}`}
                    {...register('current_living_address')}
                    placeholder="Current residence address"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hometown Address</label>
                <div className="input-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.home_town_address ? 'filled' : ''}`}
                    {...register('home_town_address')}
                    placeholder="Permanent address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Japan Information Section */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">🗾</span>
              Japan Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name in Japanese</label>
                <div className="input-wrapper">
                  <Globe size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.name_in_japanese ? 'filled' : ''}`}
                    {...register('name_in_japanese')}
                    placeholder="カタカナ名前"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Passport Number</label>
                <div className="input-wrapper">
                  <FileText size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.passport_number ? 'filled' : ''}`}
                    {...register('passport_number')}
                    placeholder="e.g., AB123456"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Highest JLPT Level</label>
                <div className="input-wrapper">
                  <BookOpen size={18} className="input-icon" />
                  <select
                    className={`form-select ${formValues.passed_highest_jlpt_level ? 'filled' : ''}`}
                    {...register('passed_highest_jlpt_level')}
                  >
                    <option value="">Select JLPT level</option>
                    <option value="N5">N5 (Beginner)</option>
                    <option value="N4">N4 (Elementary)</option>
                    <option value="N3">N3 (Intermediate)</option>
                    <option value="N2">N2 (Upper Intermediate)</option>
                    <option value="N1">N1 (Advanced)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Desired Job Type</label>
                <div className="input-wrapper">
                  <Briefcase size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.desired_job_type ? 'filled' : ''}`}
                    {...register('desired_job_type')}
                    placeholder="e.g., IT, Engineering, Hospitality"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Family & Additional Information */}
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">👨‍👩‍👧</span>
              Family & Additional Information
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Father's Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.father_name ? 'filled' : ''}`}
                    {...register('father_name')}
                    placeholder="Father's full name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Religion</label>
                <div className="input-wrapper">
                  <Globe size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.religion ? 'filled' : ''}`}
                    {...register('religion')}
                    placeholder="e.g., Buddhist, Christian, Muslim"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Viber Contact</label>
                <div className="input-wrapper">
                  <Phone size={18} className="input-icon" />
                  <input
                    type="text"
                    className={`form-input ${formValues.contact_viber ? 'filled' : ''}`}
                    {...register('contact_viber')}
                    placeholder="Viber phone number"
                  />
                </div>
              </div>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('is_smoking')}
                />
                <span className="checkbox-text">Smoking</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('is_alcohol_drink')}
                />
                <span className="checkbox-text">Alcohol Drink</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('have_tatto')}
                />
                <span className="checkbox-text">Tattoo</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  {...register('hostel_preference')}
                />
                <span className="checkbox-text">Hostel Preference</span>
              </label>
            </div>
          </div>

          {/* Status Section (Only for Edit) */}
          {isEditing && (
            <div className="form-section">
              <h3 className="section-title">
                <span className="section-icon">⚙️</span>
                System Status
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Registration Status</label>
                  <div className="input-wrapper">
                    <Info size={18} className="input-icon" />
                    <select
                      className="form-select"
                      {...register('registration_status')}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="ENROLLED">Enrolled</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Information Card */}
          <div className="info-card">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>Important Notes</h4>
              <ul>
                <li>Student ID will be auto-generated (STU001, STU002, etc.)</li>
                <li>National ID must be unique in the system</li>
                <li>Registration status determines student access level</li>
                <li>JLPT level helps with course placement</li>
                <li>All fields marked with <span className="required">*</span> are required</li>
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
                onClick={() => navigate('/students')}
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
                <span>{loading ? 'Saving...' : (isEditing ? 'Update Student' : 'Register Student')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .student-form-module {
          padding: 1.5rem;
          max-width: 1200px;
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

        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-text {
          font-size: 0.85rem;
          color: #334155;
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
          .student-form-module {
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
          
          .checkbox-group {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentForm;