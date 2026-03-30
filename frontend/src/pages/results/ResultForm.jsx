import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const ResultForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => { toast.success(isEditing ? 'Result updated!' : 'Result recorded!'); setLoading(false); navigate('/results'); }, 800);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/results')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}><ChevronLeft size={20} /></button>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '0.25rem' }}>{isEditing ? 'Edit Result' : 'Enter Test Result'}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Record a student's test score and feedback.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>Result Entry</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {['Enrollment (Student + Course)', 'Test'].map((label, i) => (
              <div key={i}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{label}</label>
                <select {...register(label.toLowerCase().replace(/\s+/g, '_'))} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}>
                  <option>Select...</option>
                </select>
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Score Obtained <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
              <input type="number" step="0.01" {...register('scoreObtained', { required: true })} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-strong)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Graded By</label>
              <select {...register('gradedBy')} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}>
                <option value="">Select teacher</option>
                <option value="1">Yamamoto Keiko</option>
                <option value="2">Tanaka Hiroshi</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Teacher Feedback</label>
            <textarea {...register('teacherFeedback')} rows={4} style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} placeholder="Enter feedback for the student..." />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => navigate('/results')} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', fontWeight: '500' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            <Save size={18} />{loading ? 'Saving...' : 'Save Result'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResultForm;
