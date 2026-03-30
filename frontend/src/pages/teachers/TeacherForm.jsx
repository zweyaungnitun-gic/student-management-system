import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChevronLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: isEditing ? { name: 'Yamamoto Keiko', email: 'keiko@gicm.edu', department: 'Japanese Language' } : {}
  });
  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => { toast.success(isEditing ? 'Teacher updated!' : 'Teacher created!'); setLoading(false); navigate('/teachers'); }, 800);
  };
  const Field = ({ label, name, type = 'text', required = false }) => (
    <div className="form-group">
      <label className="form-label">{label} {required && <span className="required">*</span>}</label>
      <input type={type} className={`form-control${errors[name] ? ' error' : ''}`} {...register(name, { required })} />
      {errors[name] && <span className="form-error">Required</span>}
    </div>
  );
  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/teachers')} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ChevronLeft size={16}/> Back</button>
        <div>
          <h1 className="page-title">{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</h1>
          <p className="page-subtitle">Manage teacher profile and department assignment.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <h4 className="form-section-title">Teacher Information</h4>
          <div className="form-grid">
            <Field label="Full Name" name="name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Department" name="department" />
            <Field label="Teacher Code (optional)" name="teacherCode" />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/teachers')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16}/> {loading ? 'Saving...' : 'Save Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default TeacherForm;
