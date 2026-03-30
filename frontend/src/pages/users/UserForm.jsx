import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userService } from '../../api/userService';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      username: '',
      email: '',
      role: 'GUEST',
      password: '',
      school_name: ''
    }
  });

  useEffect(() => {
    if (isEditing) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await userService.getById(id);
      const user = response;
      setValue('username', user.username || '');
      setValue('email', user.email || '');
      setValue('role', user.role || 'GUEST');
      setValue('school_name', user.school_name || user.schoolName || '');
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user data');
      navigate('/users');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        const updateData = {
          username: data.username,
          email: data.email,
          role: data.role,
          school_name: data.school_name
        };
        if (data.password && data.password.trim()) {
          updateData.password = data.password;
        }
        await userService.update(id, updateData);
        toast.success('User information updated');
      } else {
        await userService.create(data);
        toast.success('User added successfully');
      }
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
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
            onClick={() => navigate('/users')}
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              {isEditing ? 'Edit User' : 'Add New User'}
            </h1>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <div className="card" style={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: '900px', width: '100%' }}>
          <div className="card-body" style={{ padding: '1.5rem 2rem' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {isEditing && (
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-3 col-form-label fw-semibold">User ID</label>
                  <div className="col-sm-9">
                    <input type="text" className="form-control bg-light" value={id} readOnly />
                  </div>
                </div>
              )}

              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Username <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    {...register('username', { 
                      required: 'Username is required',
                      maxLength: { value: 25, message: 'Max 25 characters' }
                    })}
                    placeholder="Enter username"
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username.message}</div>
                  )}
                </div>
              </div>

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

              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Role <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <select
                    className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                    {...register('role', { required: 'Role is required' })}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="GUEST">Guest</option>
                  </select>
                  {errors.role && (
                    <div className="invalid-feedback">{errors.role.message}</div>
                  )}
                </div>
              </div>

              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  School / Organization
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control ${errors.school_name ? 'is-invalid' : ''}`}
                    {...register('school_name')}
                    placeholder="Enter school or organization name"
                  />
                  <small className="text-muted">Optional</small>
                </div>
              </div>

              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Password {!isEditing && <span className="text-danger">*</span>}
                </label>
                <div className="col-sm-9">
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      {...register('password', { 
                        required: !isEditing ? 'Password is required' : false,
                        minLength: { value: 4, message: 'Minimum 4 characters' }
                      })}
                      placeholder={isEditing ? 'Leave blank to keep unchanged' : 'Enter password'}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="invalid-feedback d-block">{errors.password.message}</div>
                  )}
                  {isEditing && (
                    <small className="text-muted">Leave blank to keep current password</small>
                  )}
                </div>
              </div>

              <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                <div>
                  <strong>Notes:</strong><br />
                  • Admin users have full access to all management features<br />
                  • Guest users have limited read-only access<br />
                  • Email addresses must be unique in the system
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-sm-9 offset-sm-3">
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => navigate('/users')}
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
                      {loading ? 'Saving...' : 'Save User'}
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

export default UserForm;