import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: isEditing ? { username: 'guest_yamada', email: 'yamada@school.ac.jp', role: 'GUEST', schoolName: 'Yamada High School' } : {}
  });

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => { toast.success(isEditing ? 'User updated!' : 'User created!'); setLoading(false); navigate('/users'); }, 800);
  };

  const Field = ({ label, name, type = 'text', required = false }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--accent-danger)' }}>*</span>}
      </label>
      <input type={type} {...register(name, { required })} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-base)', border: `1px solid ${errors[name] ? 'var(--accent-danger)' : 'var(--border-strong)'}`, borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
        onBlur={(e) => e.target.style.borderColor = errors[name] ? 'var(--accent-danger)' : 'var(--border-strong)'} />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/users')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}><ChevronLeft size={20} /></button>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>{isEditing ? 'Edit User' : 'Create New User'}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage system access and roles.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>Account Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <Field label="Username" name="username" required />
            <Field label="Email Address" name="email" type="email" required />
            {!isEditing && <Field label="Password" name="password" type="password" required />}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Role <span style={{ color: 'var(--accent-danger)' }}>*</span>
              </label>
              <select {...register('role', { required: true })} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="">Select role</option>
                <option value="ADMIN">Admin</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>
            <Field label="School / Organization" name="schoolName" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => navigate('/users')} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            <Save size={18} />{loading ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
