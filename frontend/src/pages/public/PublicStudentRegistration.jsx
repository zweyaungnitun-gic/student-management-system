import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Home,
  GraduationCap,
  Globe,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader
} from 'lucide-react';
import { registrationLinkService } from '../../api/registrationLinkService';
import toast from 'react-hot-toast';

const PublicStudentRegistration = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [linkValid, setLinkValid] = useState(false);
  const [linkInfo, setLinkInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm({
    mode: 'onBlur',
    defaultValues: {
      // Page 1 defaults
      gender: '',
      religion: '',
      education_background: '',
      
      // Page 2 defaults
      current_japan_level: '',
      passed_highest_jlpt_level: '',
      intended_study_period: '',
      japan_travel_experience: false,
      coe_application_experience: false,
      is_smoking: false,
      is_alcohol_drink: false,
      have_tatto: false,
      hostel_preference: false,
    }
  });

  // Validate token on mount
  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    console.log('Validating token:', token);
    try {
      const response = await registrationLinkService.validateToken(token);
      console.log('Token valid:', response.data);
      setLinkValid(true);
      setLinkInfo(response.data);
    } catch (error) {
      console.error('Token validation failed:', error);
      setLinkValid(false);
    } finally {
      setValidating(false);
      setLoading(false);
      console.log('Validation complete. valid:', linkValid, 'validating:', validating);
    }
  };

  const onSubmitPage1 = async (data) => {
    const isValid = await trigger();
    if (isValid) {
      setCurrentPage(2);
      window.scrollTo(0, 0);
    }
  };

  const onFinalSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        token,
        page1: {
          student_name: data.student_name,
          email: data.email,
          national_id: data.national_id,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          phone_number: data.phone_number,
          secondary_phone: data.secondary_phone,
          current_living_address: data.current_living_address,
          home_town_address: data.home_town_address,
          religion: data.religion,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          parent_name: data.parent_name,
          parent_phone: data.parent_phone,
          education_background: data.education_background,
          graduation_year: data.graduation_year ? parseInt(data.graduation_year) : null,
        },
        page2: {
          name_in_japanese: data.name_in_japanese,
          passport_number: data.passport_number,
          current_japan_level: data.current_japan_level,
          japan_travel_experience: data.japan_travel_experience,
          coe_application_experience: data.coe_application_experience,
          passed_highest_jlpt_level: data.passed_highest_jlpt_level,
          desired_job_type: data.desired_job_type,
          other_desired_job_type: data.other_desired_job_type,
          desired_location_in_japan: data.desired_location_in_japan,
          intended_study_period: data.intended_study_period,
          japanese_learning_history: data.japanese_learning_history,
          is_smoking: data.is_smoking,
          is_alcohol_drink: data.is_alcohol_drink,
          have_tatto: data.have_tatto,
          hostel_preference: data.hostel_preference,
          memo_notes: data.memo_notes,
        }
      };

      await registrationLinkService.submitRegistration(payload);
      setSubmitted(true);
      toast.success('Registration submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <Loader className="animate-spin mb-3" size={48} />
          <p className="text-muted">Validating registration link...</p>
        </div>
      </div>
    );
  }

  if (!linkValid) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg border-0" style={{ maxWidth: '500px', borderRadius: '16px' }}>
          <div className="card-body p-5 text-center">
            <div className="rounded-circle bg-danger bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
              <AlertCircle size={40} className="text-danger" />
            </div>
            <h3 className="fw-bold mb-2">Invalid Registration Link</h3>
            <p className="text-muted mb-4">
              This registration link is invalid, expired, or has been deactivated. Please contact your administrator for a valid link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow-lg border-0" style={{ maxWidth: '500px', borderRadius: '16px' }}>
          <div className="card-body p-5 text-center">
            <div className="rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
              <CheckCircle size={40} className="text-success" />
            </div>
            <h3 className="fw-bold mb-2">Registration Submitted!</h3>
            <p className="text-muted mb-4">
              Thank you for your registration. We will review your application and contact you soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div 
            className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{ 
              width: '80px', 
              height: '80px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <GraduationCap size={40} className="text-white" />
          </div>
          <h2 className="fw-bold mb-1">Student Registration</h2>
          <p className="text-muted">{linkInfo?.link_name || 'Online Registration'}</p>
        </div>

        {/* Progress Steps */}
        <div className="d-flex justify-content-center mb-4">
          <div className="d-flex align-items-center">
            <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentPage >= 1 ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ width: '40px', height: '40px' }}>
              1
            </div>
            <div className="mx-2 text-muted small">Personal Info</div>
          </div>
          <div className="mx-3" style={{ width: '50px', height: '2px', background: currentPage >= 2 ? '#667eea' : '#dee2e6' }}></div>
          <div className="d-flex align-items-center">
            <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentPage >= 2 ? 'bg-primary text-white' : 'bg-secondary text-white'}`} style={{ width: '40px', height: '40px' }}>
              2
            </div>
            <div className="mx-2 text-muted small">Japanese Info</div>
          </div>
        </div>

        {/* Page 1: Personal Information */}
        {currentPage === 1 && (
          <div className="card shadow-lg border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <User className="text-primary" />
                Personal Information
              </h4>

              <form onSubmit={handleSubmit(onSubmitPage1)}>
                {/* Name and Email */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.student_name ? 'is-invalid' : ''}`}
                      placeholder="Enter your full name"
                      {...register('student_name', { required: 'Name is required' })}
                    />
                    {errors.student_name && <div className="invalid-feedback">{errors.student_name.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email Address *</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="your@email.com"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                      })}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                  </div>
                </div>

                {/* National ID and Date of Birth */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">National ID *</label>
                    <input
                      type="text"
                      className={`form-control ${errors.national_id ? 'is-invalid' : ''}`}
                      placeholder="Enter your National ID"
                      {...register('national_id', { required: 'National ID is required' })}
                    />
                    {errors.national_id && <div className="invalid-feedback">{errors.national_id.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      {...register('date_of_birth')}
                    />
                  </div>
                </div>

                {/* Gender and Religion */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Gender</label>
                    <select className="form-select" {...register('gender')}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Religion</label>
                    <select className="form-select" {...register('religion')}>
                      <option value="">Select Religion</option>
                      <option value="buddhist">Buddhist</option>
                      <option value="christian">Christian</option>
                      <option value="hindu">Hindu</option>
                      <option value="muslim">Muslim</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2">
                      <Phone size={16} />
                      Primary Phone
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+95 9..."
                      {...register('phone_number')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2">
                      <Phone size={16} />
                      Secondary Phone
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Alternative phone number"
                      {...register('secondary_phone')}
                    />
                  </div>
                </div>

                {/* Addresses */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2">
                      <MapPin size={16} />
                      Current Living Address
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Your current address"
                      {...register('current_living_address')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2">
                      <Home size={16} />
                      Home Town Address
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Your permanent address"
                      {...register('home_town_address')}
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="card bg-light border-0 mb-3">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Emergency Contact</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Contact Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Emergency contact person"
                          {...register('emergency_contact_name')}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Contact Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Emergency contact number"
                          {...register('emergency_contact_phone')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="card bg-light border-0 mb-3">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Parent/Guardian Information</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Parent/Guardian Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Parent or guardian name"
                          {...register('parent_name')}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Parent/Guardian Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Parent contact number"
                          {...register('parent_phone')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education Background */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2">
                      <GraduationCap size={16} />
                      Education Background
                    </label>
                    <select className="form-select" {...register('education_background')}>
                      <option value="">Select Education Level</option>
                      <option value="high_school">High School</option>
                      <option value="diploma">Diploma</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Graduation Year</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="YYYY"
                      min="1980"
                      max="2030"
                      {...register('graduation_year')}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary btn-lg d-flex align-items-center gap-2">
                    Next Step
                    <ChevronRight size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Page 2: Japanese Information */}
        {currentPage === 2 && (
          <div className="card shadow-lg border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <Globe className="text-primary" />
                Japanese Study Information
              </h4>

              <form onSubmit={handleSubmit(onFinalSubmit)}>
                {/* Japanese Name and Passport */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Name in Japanese (カタカナ)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="カタカナでお名前を入力"
                      {...register('name_in_japanese')}
                    />
                    <small className="text-muted">Enter your name in Katakana if known</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Passport Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Your passport number"
                      {...register('passport_number')}
                    />
                  </div>
                </div>

                {/* JLPT Levels */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Current Japanese Level</label>
                    <select className="form-select" {...register('current_japan_level')}>
                      <option value="">Select Level</option>
                      <option value="Beginner">Beginner (No experience)</option>
                      <option value="N5">N5 (Basic)</option>
                      <option value="N4">N4 (Elementary)</option>
                      <option value="N3">N3 (Intermediate)</option>
                      <option value="N2">N2 (Upper-Intermediate)</option>
                      <option value="N1">N1 (Advanced)</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Highest JLPT Passed</label>
                    <select className="form-select" {...register('passed_highest_jlpt_level')}>
                      <option value="">Select Level</option>
                      <option value="None">None</option>
                      <option value="N5">N5</option>
                      <option value="N4">N4</option>
                      <option value="N3">N3</option>
                      <option value="N2">N2</option>
                      <option value="N1">N1</option>
                    </select>
                  </div>
                </div>

                {/* Experience Checkboxes */}
                <div className="card bg-light border-0 mb-3">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Experience</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="japan_travel"
                            {...register('japan_travel_experience')}
                          />
                          <label className="form-check-label" htmlFor="japan_travel">
                            I have traveled to Japan before
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="coe_exp"
                            {...register('coe_application_experience')}
                          />
                          <label className="form-check-label" htmlFor="coe_exp">
                            I have applied for COE before
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Study and Job Preferences */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Desired Location in Japan</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Tokyo, Osaka, Fukuoka"
                      {...register('desired_location_in_japan')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Intended Study Period</label>
                    <select className="form-select" {...register('intended_study_period')}>
                      <option value="">Select Duration</option>
                      <option value="6_months">6 Months</option>
                      <option value="1_year">1 Year</option>
                      <option value="2_years">2 Years</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Desired Job Type</label>
                    <select className="form-select" {...register('desired_job_type')}>
                      <option value="">Select Job Type</option>
                      <option value="factory">Factory Work</option>
                      <option value="restaurant">Restaurant/Food Service</option>
                      <option value="hotel">Hotel/Hospitality</option>
                      <option value="caregiving">Caregiving</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Other Desired Job (if any)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Specify other job type"
                      {...register('other_desired_job_type')}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Japanese Learning History</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="How have you learned Japanese? (Self-study, School, Language center, etc.)"
                    {...register('japanese_learning_history')}
                  />
                </div>

                {/* Personal Preferences */}
                <div className="card bg-light border-0 mb-3">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Personal Preferences</h6>
                    <div className="row g-2">
                      <div className="col-6 col-md-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="smoking"
                            {...register('is_smoking')}
                          />
                          <label className="form-check-label" htmlFor="smoking">Smoking</label>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="alcohol"
                            {...register('is_alcohol_drink')}
                          />
                          <label className="form-check-label" htmlFor="alcohol">Drink Alcohol</label>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="tattoo"
                            {...register('have_tatto')}
                          />
                          <label className="form-check-label" htmlFor="tattoo">Have Tattoo</label>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="hostel"
                            {...register('hostel_preference')}
                          />
                          <label className="form-check-label" htmlFor="hostel">Need Hostel/Dorm</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="mb-4">
                  <label className="form-label fw-semibold d-flex align-items-center gap-2">
                    <FileText size={16} />
                    Additional Notes / Memo
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Any additional information you'd like to share..."
                    {...register('memo_notes')}
                  />
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary d-flex align-items-center gap-2"
                    onClick={() => setCurrentPage(1)}
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg d-flex align-items-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Submit Registration
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStudentRegistration;
