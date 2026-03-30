import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { courseService } from '../../api/courseService';
import { teacherService } from '../../api/teacherService';

const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachersData = await teacherService.getAll();
        setTeachers(teachersData);

        if (isEditing) {
          const course = await courseService.getById(id);
          reset({
            course_code: course.course_code,
            course_name: course.course_name,
            credits: course.credits,
            description: course.description,
            is_active: course.is_active
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('データの取得に失敗しました');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isEditing) {
        await courseService.update(id, data);
        toast.success('コースを更新しました');
      } else {
        await courseService.create(data);
        toast.success('新しいコースを作成しました');
      }
      navigate('/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.response?.data?.detail || '保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button onClick={() => navigate('/courses')} className="btn btn-outline-secondary btn-icon">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="h3 mb-1">{isEditing ? 'コース編集' : '新規コース作成'}</h1>
          <p className="text-muted mb-0">コースの詳細情報を入力してください。</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-4">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Course Code *</label>
            <input 
              type="text" 
              className={`form-control ${errors.course_code ? 'is-invalid' : ''}`}
              {...register('course_code', { required: 'コースコードは必須です' })}
              placeholder="e.g. JPN-N5"
            />
            {errors.course_code && <div className="invalid-feedback">{errors.course_code.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Course Name *</label>
            <input 
              type="text" 
              className={`form-control ${errors.course_name ? 'is-invalid' : ''}`}
              {...register('course_name', { required: 'コース名は必須です' })}
              placeholder="e.g. Japanese N5 Basic"
            />
            {errors.course_name && <div className="invalid-feedback">{errors.course_name.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Credits</label>
            <input 
              type="number" 
              className="form-control"
              {...register('credits', { valueAsNumber: true })}
              placeholder="4"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Status</label>
            <div className="form-check form-switch pt-2">
              <input 
                className="form-check-input" 
                type="checkbox" 
                {...register('is_active')}
                defaultChecked={true}
              />
              <label className="form-check-label">Active</label>
            </div>
          </div>

          <div className="col-12">
            <label className="form-label fw-bold small text-uppercase">Description</label>
            <textarea 
              className="form-control"
              rows={3}
              {...register('description')}
              placeholder="Course description..."
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" onClick={() => navigate('/courses')} className="btn btn-light">
            キャンセル
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary d-flex align-items-center gap-2">
            <Save size={18} />
            {loading ? '保存中...' : (isEditing ? '更新を保存' : 'コースを作成')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
