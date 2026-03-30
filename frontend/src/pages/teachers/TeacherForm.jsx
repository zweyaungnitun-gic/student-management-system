import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChevronLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { teacherService } from '../../api/teacherService';

const TeacherForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEditing) {
      const fetchTeacher = async () => {
        try {
          const data = await teacherService.getById(id);
          reset({
            full_name: data.full_name,
            email: data.email,
            department: data.department,
            teacher_code: data.teacher_code,
            is_active: data.is_active
          });
        } catch (error) {
          console.error('Error fetching teacher:', error);
          toast.error('教師情報の取得に失敗しました');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchTeacher();
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isEditing) {
        await teacherService.update(id, data);
        toast.success('教師情報を更新しました');
      } else {
        await teacherService.create(data);
        toast.success('新しい教師を追加しました');
      }
      navigate('/teachers');
    } catch (error) {
      console.error('Error saving teacher:', error);
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
        <button onClick={() => navigate('/teachers')} className="btn btn-outline-secondary btn-icon">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="h3 mb-1">{isEditing ? '教師情報編集' : '新規教師追加'}</h1>
          <p className="text-muted mb-0">教師のプロフィールと所属部署を管理します。</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-4">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Full Name *</label>
            <input 
              type="text" 
              className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
              {...register('full_name', { required: '名前は必須です' })}
              placeholder="e.g. Yamamoto Keiko"
            />
            {errors.full_name && <div className="invalid-feedback">{errors.full_name.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Email *</label>
            <input 
              type="email" 
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register('email', { required: 'メールアドレスは必須です' })}
              placeholder="e.g. keiko@example.edu"
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Department</label>
            <input 
              type="text" 
              className="form-control"
              {...register('department')}
              placeholder="e.g. Japanese Language"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Teacher Code</label>
            <input 
              type="text" 
              className="form-control"
              {...register('teacher_code')}
              placeholder="e.g. TCH001"
            />
          </div>

          {!isEditing && (
            <div className="col-md-6">
              <label className="form-label fw-bold small text-uppercase">Initial Status</label>
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
          )}
        </div>

        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" onClick={() => navigate('/teachers')} className="btn btn-light">
            キャンセル
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary d-flex align-items-center gap-2">
            <Save size={18} />
            {loading ? '保存中...' : (isEditing ? '更新を保存' : '教師を登録')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;
