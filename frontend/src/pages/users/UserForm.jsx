import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Lock, User as UserIcon, Mail, School } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userService } from '../../api/userService';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isEditing) {
      const fetchUser = async () => {
        try {
          const user = await userService.getById(id);
          reset({
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            school_name: user.school_name
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          toast.error('ユーザー情報の取得に失敗しました');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isEditing) {
        await userService.update(id, data);
        toast.success('ユーザー情報を更新しました');
      } else {
        await userService.create(data);
        toast.success('新しいユーザーを作成しました');
      }
      navigate('/users');
    } catch (error) {
      console.error('Error saving user:', error);
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
        <button onClick={() => navigate('/users')} className="btn btn-outline-secondary btn-icon">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="h3 mb-1">{isEditing ? 'ユーザー編集' : '新規ユーザー作成'}</h1>
          <p className="text-muted mb-0">システムへのアクセス権限とロールを管理します。</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-4">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Username *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><UserIcon size={18} className="text-muted"/></span>
              <input 
                type="text" 
                className={`form-control border-start-0 ${errors.username ? 'is-invalid' : ''}`}
                {...register('username', { required: 'ユーザー名は必須です' })}
                placeholder="johndoe"
              />
            </div>
            {errors.username && <div className="invalid-feedback d-block">{errors.username.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Email Address *</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><Mail size={18} className="text-muted"/></span>
              <input 
                type="email" 
                className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                {...register('email', { required: 'メールアドレスは必須です' })}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
          </div>

          {!isEditing && (
            <div className="col-md-6">
              <label className="form-label fw-bold small text-uppercase">Password *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><Lock size={18} className="text-muted"/></span>
                <input 
                  type="password" 
                  className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password', { required: 'パスワードは必須です' })}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
            </div>
          )}

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Full Name</label>
            <input 
              type="text" 
              className="form-control"
              {...register('full_name')}
              placeholder="John Doe"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Role *</label>
            <select 
              className={`form-select ${errors.role ? 'is-invalid' : ''}`}
              {...register('role', { required: 'ロールを選択してください' })}
            >
              <option value="">Select role...</option>
              <option value="ADMIN">Admin (管理者)</option>
              <option value="GUEST">Guest (ゲスト/提携校)</option>
            </select>
            {errors.role && <div className="invalid-feedback">{errors.role.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">School / Organization</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><School size={18} className="text-muted"/></span>
              <input 
                type="text" 
                className="form-control border-start-0"
                {...register('school_name')}
                placeholder="GICM / Partner School"
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" onClick={() => navigate('/users')} className="btn btn-light">
            キャンセル
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary d-flex align-items-center gap-2">
            <Save size={18} />
            {loading ? '保存中...' : (isEditing ? '更新を保存' : 'ユーザーを作成')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
