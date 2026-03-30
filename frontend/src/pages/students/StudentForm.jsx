import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { studentService } from '../../api/studentService';

const StudentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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
          contact_viber
        }
      };

      if (isEditing) {
        await studentService.update(id, payload);
        toast.success('Student updated successfully!');
      } else {
        await studentService.create(payload);
        toast.success('Student registered successfully!');
      }
      navigate('/students');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred during submission.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', required = false, options }) => (
    <div className="col-md-6 mb-3">
      <label className="form-label">{label} {required && <span className="text-danger">*</span>}</label>
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

  if (fetching) {
    return (
      <div className="premium-loader py-5">
        <div className="spinner-border" role="status"></div>
        Loading form...
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-light shadow-sm fw-semibold" onClick={() => navigate('/students')}>
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
        <div>
          <h1 className="page-title fs-3 mb-1">{isEditing ? 'Edit Student Profile' : 'Student Enrollment'}</h1>
          <p className="page-subtitle mb-0">{isEditing ? 'Update existing student records' : 'Register a new student into the directory.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information */}
        <div className="glass-card mb-4 p-0 overflow-hidden">
          <div className="section-header-blue">
            <i className="bi bi-person-badge opacity-75"></i>Personal Details
          </div>
          <div className="row p-4 pt-4">
            <Field label="Full Name"       name="student_name"  required />
            <Field label="National ID"     name="national_id"   required />
            <Field label="Date of Birth"   name="date_of_birth" type="date" />
            <Field label="Gender"          name="gender"        options={['Male', 'Female', 'Other']} />
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass-card mb-4 p-0 overflow-hidden">
          <div className="section-header-blue">
            <i className="bi bi-telephone opacity-75"></i>Contact & Addressing
          </div>
          <div className="row p-4 pt-4">
            <Field label="Phone Number"    name="phone_number" />
            <Field label="Email Address"   name="email"         type="email" />
            <Field label="Current Address" name="current_living_address" />
            <Field label="Hometown Address"name="home_town_address" />
          </div>
        </div>
        
        {/* Additional / Japan Information */}
        <div className="glass-card mb-4 p-0 overflow-hidden">
          <div className="section-header-blue">
            <i className="bi bi-airplane opacity-75"></i>Additional & Japan Info
          </div>
          <div className="row p-4 pt-4">
            <Field label="Name in Japanese" name="name_in_japanese" />
            <Field label="Passport Number"  name="passport_number" />
            <Field label="Highest JLPT Level" name="passed_highest_jlpt_level" options={['N5', 'N4', 'N3', 'N2', 'N1']} />
            <Field label="Desired Job Type" name="desired_job_type" />
            <Field label="Father's Name"    name="father_name" />
            <Field label="Viber Contact"    name="contact_viber" />
          </div>
        </div>

        {/* Status (Only on Edit) */}
        {isEditing && (
          <div className="glass-card mb-4 p-0 overflow-hidden">
            <div className="section-header-blue">
              <i className="bi bi-sliders opacity-75"></i>System Status
            </div>
            <div className="row p-4 pt-4">
              <Field label="Registration Status" name="registration_status" options={['PENDING', 'ACCEPTED', 'REJECTED', 'ENROLLED', 'COMPLETED']} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex justify-content-end gap-3 mb-5">
          <button type="button" className="btn btn-light shadow-sm fw-semibold" onClick={() => navigate('/students')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
            ) : (
              <><i className="bi bi-check-circle-fill me-2"></i>{isEditing ? 'Save Changes' : 'Register Student'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
