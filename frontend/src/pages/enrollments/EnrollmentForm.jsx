import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const EnrollmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      toast.success(isEditing ? 'Enrollment updated!' : 'Enrollment created!');
      setLoading(false);
      navigate('/enrollments');
    }, 800);
  };

  const SelectField = ({ label, name, options, required }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--accent-danger)' }}>*</span>}
      </label>
      <select {...register(name, { required })} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-base)', border: `1px solid ${errors[name] ? 'var(--accent-danger)' : 'var(--border-strong)'}`, borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/enrollments')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>{isEditing ? 'Edit Enrollment' : 'New Enrollment'}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Assign a student to a course for a given semester.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>Enrollment Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <SelectField label="Student" name="studentId" required options={[
              { value: '1', label: 'John Doe (ST-001)' },
              { value: '2', label: 'Jane Smith (ST-002)' },
              { value: '3', label: 'Robert Johnson (ST-003)' },
            ]} />
            <SelectField label="Course" name="courseId" required options={[
              { value: '1', label: 'Japanese N5 (JPN-N5)' },
              { value: '2', label: 'Japanese N4 (JPN-N4)' },
              { value: '3', label: 'Japanese N3 (JPN-N3)' },
            ]} />
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Semester <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input type="text" placeholder="e.g. 2024-S1" {...register('semester', { required: true })} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
            <SelectField label="Initiated By" name="initiatedBy" options={[
              { value: 'admin', label: 'Admin' },
              { value: 'student', label: 'Student' },
            ]} />
            {isEditing && (
              <SelectField label="Status" name="status" options={[
                { value: 'pending', label: 'Pending' },
                { value: 'enrolled', label: 'Enrolled' },
                { value: 'completed', label: 'Completed' },
                { value: 'dropped', label: 'Dropped' },
                { value: 'failed', label: 'Failed' },
              ]} />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => navigate('/enrollments')} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            <Save size={18} />{loading ? 'Saving...' : 'Save Enrollment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollmentForm;
