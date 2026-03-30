// frontend/src/pages/teachers/TeacherForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import client from '../../api/client';

const TeacherForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      department: '',
    }
  });

  useEffect(() => {
    if (isEditing) {
      fetchTeacher();
    }
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const response = await client.get(`/teachers/${id}`);
      const teacher = response.data;
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
        await client.put(`/teachers/edit/${id}`, data);
        toast.success('Teacher information updated');
      } else {
        await client.post('/teachers/add', data);
        toast.success('Teacher added successfully');
      }
      navigate('/teachers');
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => navigate('/teachers')}
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
            </h1>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <div className="card" style={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: '900px', width: '100%' }}>
          <div className="card-body" style={{ padding: '1.5rem 2rem' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* User ID (display only for edit) */}
              {isEditing && (
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-3 col-form-label fw-semibold">
                    Teacher ID
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={id}
                      readOnly
                    />
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    {...register('name', { 
                      required: 'Name is required',
                      maxLength: { value: 100, message: 'Max 100 characters' }
                    })}
                    placeholder="Enter teacher's full name"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name.message}</div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Enter a valid email address'
                      }
                    })}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email.message}</div>
                  )}
                </div>
              </div>

              {/* Department */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Department
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                    {...register('department')}
                    placeholder="e.g., Computer Science, Business Administration"
                  />
                  <small className="text-muted">Optional</small>
                  {errors.department && (
                    <div className="invalid-feedback">{errors.department.message}</div>
                  )}
                </div>
              </div>

              {/* Info Alert */}
              <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                <div>
                  <strong>Notes:</strong><br />
                  • Email address must be unique in the system<br />
                  • Teacher code will be automatically generated (e.g., TCH001)<br />
                  • Deactivated teachers cannot be assigned to new courses
                </div>
              </div>

              {/* Form Actions */}
              <div className="row mt-4">
                <div className="col-sm-9 offset-sm-3">
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => navigate('/teachers')}
                    >
                      <X size={16} className="me-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={loading}
                    >
                      <Save size={16} className="me-2" />
                      {loading ? 'Saving...' : 'Save Teacher'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherForm;