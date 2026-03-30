import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: isEditing ? { studentName: 'John Doe', nationalId: '123456789', gender: 'Male', phoneNumber: '555-1234' } : {}
  });

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      toast.success(isEditing ? 'Student updated!' : 'Student registered!');
      setLoading(false);
      navigate('/students');
    }, 800);
  };

  const Field = ({ label, name, type = 'text', required = false, options }) => (
    <div className="col-md-6 mb-3">
      <label className="form-label fw-semibold">{label} {required && <span className="text-danger">*</span>}</label>
      {options ? (
        <select className={`form-select${errors[name] ? ' is-invalid' : ''}`} {...register(name, { required })}>
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} className={`form-control${errors[name] ? ' is-invalid' : ''}`} {...register(name, { required })} />
      )}
      {errors[name] && <div className="invalid-feedback">This field is required.</div>}
    </div>
  );

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/students')}>
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
        <div>
          <h4 className="fw-bold mb-1">{isEditing ? 'Edit Student' : 'New Student Registration'}</h4>
          <p className="text-muted small mb-0">{isEditing ? 'Update student record' : 'Register a new student in the system.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information */}
        <div className="bg-white rounded-3 shadow-sm overflow-hidden mb-4">
          <div className="section-header-blue">
            <i className="bi bi-person-fill me-2"></i>Personal Information
          </div>
          <div className="row p-3">
            <Field label="Full Name"       name="studentName"  required />
            <Field label="National ID"     name="nationalId"   required />
            <Field label="Date of Birth"   name="dateOfBirth"  type="date" required />
            <Field label="Gender"          name="gender"       required options={['Male', 'Female', 'Other']} />
            <Field label="Phone Number"    name="phoneNumber" />
            <Field label="Email Address"   name="email"        type="email" />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-3 shadow-sm overflow-hidden mb-4">
          <div className="section-header-blue">
            <i className="bi bi-geo-alt-fill me-2"></i>Address Details
          </div>
          <div className="row p-3">
            <Field label="Current Address"  name="currentLivingAddress" />
            <Field label="Hometown Address" name="homeTownAddress" />
          </div>
        </div>

        {/* Japan */}
        <div className="bg-white rounded-3 shadow-sm overflow-hidden mb-4">
          <div className="section-header-blue">
            <i className="bi bi-airplane-fill me-2"></i>Japan Information
          </div>
          <div className="row p-3">
            <Field label="JLPT Level"          name="jlptLevel"          options={['N5', 'N4', 'N3', 'N2', 'N1']} />
            <Field label="Desired Occupation"  name="desiredOccupation" />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/students')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-1"></span>Saving...</> : <><i className="bi bi-check-lg me-1"></i>Save Student</>}
          </button>
        </div>
      </form>
    </>
  );
};

export default StudentForm;
