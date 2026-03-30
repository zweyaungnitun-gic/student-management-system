import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { courseService } from '../../api/courseService';
import { teacherService } from '../../api/teacherService';

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [teachers, setTeachers] = useState([]);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      course_code: '',
      course_name: '',
      description: '',
      credit_hours: 3,
      teacher_id: '',
      is_active: true,
    }
  });

  const isActive = watch('is_active');

  useEffect(() => {
    fetchTeachers();
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll();
      setTeachers(response || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await courseService.getById(id);
      const course = response;
      setValue('course_code', course.course_code || course.courseCode || '');
      setValue('course_name', course.course_name || course.courseName || '');
      setValue('description', course.description || '');
      setValue('credit_hours', course.credit_hours || course.creditHours || 3);
      setValue('teacher_id', course.teacher_id || course.teacherId || '');
      setValue('is_active', course.is_active !== undefined ? course.is_active : true);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course data');
      navigate('/courses');
    } finally {
      setFetchLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditing) {
        await courseService.update(id, data);
        toast.success('Course information updated');
      } else {
        await courseService.create(data);
        toast.success('Course added successfully');
      }
      navigate('/courses');
    } catch (error) {
      console.error('Error saving course:', error);
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
            onClick={() => navigate('/courses')}
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              {isEditing ? 'Edit Course' : 'Add New Course'}
            </h1>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center mt-4">
        <div className="card" style={{ borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: '900px', width: '100%' }}>
          <div className="card-body" style={{ padding: '1.5rem 2rem' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Course Code */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Course Code <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control ${errors.course_code ? 'is-invalid' : ''}`}
                    {...register('course_code', { 
                      required: 'Course code is required',
                      maxLength: { value: 20, message: 'Max 20 characters' }
                    })}
                    placeholder="e.g., JPN-N5, CS-101"
                  />
                  {errors.course_code && (
                    <div className="invalid-feedback">{errors.course_code.message}</div>
                  )}
                </div>
              </div>

              {/* Course Name */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Course Name <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    type="text"
                    className={`form-control ${errors.course_name ? 'is-invalid' : ''}`}
                    {...register('course_name', { 
                      required: 'Course name is required',
                      maxLength: { value: 200, message: 'Max 200 characters' }
                    })}
                    placeholder="e.g., Japanese N5, Introduction to Programming"
                  />
                  {errors.course_name && (
                    <div className="invalid-feedback">{errors.course_name.message}</div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="row mb-3">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Description
                </label>
                <div className="col-sm-9">
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
                    rows="3"
                    placeholder="Enter course description, objectives, prerequisites..."
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description.message}</div>
                  )}
                </div>
              </div>

              {/* Credit Hours */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Credit Hours <span className="text-danger">*</span>
                </label>
                <div className="col-sm-9">
                  <input
                    type="number"
                    className={`form-control ${errors.credit_hours ? 'is-invalid' : ''}`}
                    {...register('credit_hours', { 
                      required: 'Credit hours are required',
                      min: { value: 1, message: 'Minimum 1 credit' },
                      max: { value: 10, message: 'Maximum 10 credits' }
                    })}
                  />
                  {errors.credit_hours && (
                    <div className="invalid-feedback">{errors.credit_hours.message}</div>
                  )}
                </div>
              </div>

              {/* Teacher Assignment */}
              <div className="row mb-3 align-items-center">
                <label className="col-sm-3 col-form-label fw-semibold">
                  Assign Teacher
                </label>
                <div className="col-sm-9">
                  <select
                    className={`form-select ${errors.teacher_id ? 'is-invalid' : ''}`}
                    {...register('teacher_id')}
                  >
                    <option value="">-- Select a teacher --</option>
                    {teachers.map(teacher => (
                      <option key={teacher.teacher_id || teacher.teacherId} value={teacher.teacher_id || teacher.teacherId}>
                        {teacher.name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">Optional - can be assigned later</small>
                </div>
              </div>

              {/* Status (only for edit) */}
              {isEditing && (
                <div className="row mb-3 align-items-center">
                  <label className="col-sm-3 col-form-label fw-semibold">
                    Status
                  </label>
                  <div className="col-sm-9">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isActive"
                        {...register('is_active')}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        {isActive ? 'Active' : 'Inactive'}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Alert */}
              <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                <i className="bi bi-info-circle-fill fs-4 me-3"></i>
                <div>
                  <strong>Notes:</strong><br />
                  • Course code must be unique<br />
                  • Deactivating a course with enrolled students will only hide it from active lists<br />
                  • Teachers can be assigned or changed at any time
                </div>
              </div>

              {/* Form Actions */}
              <div className="row mt-4">
                <div className="col-sm-9 offset-sm-3">
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => navigate('/courses')}
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
                      {loading ? 'Saving...' : 'Save Course'}
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

export default CourseForm;