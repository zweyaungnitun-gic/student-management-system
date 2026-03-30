import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { testService } from '../../api/testService';
import { courseService } from '../../api/courseService';

const TestForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await courseService.getAll();
        setCourses(coursesData);

        if (isEditing) {
          const test = await testService.getById(id);
          // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
          const formattedDate = test.test_date ? new Date(test.test_date).toISOString().slice(0, 16) : '';
          
          reset({
            test_name: test.test_name,
            course_id: test.course_id,
            total_marks: test.total_marks,
            passing_marks: test.passing_marks,
            test_date: formattedDate,
            description: test.description
          });
        }
      } catch (error) {
        console.error('Error fetching test data:', error);
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
      const payload = {
        ...data,
        course_id: parseInt(data.course_id),
        total_marks: parseFloat(data.total_marks),
        passing_marks: parseFloat(data.passing_marks)
      };

      if (isEditing) {
        await testService.update(id, payload);
        toast.success('テスト情報を更新しました');
      } else {
        await testService.create(payload);
        toast.success('新しいテストを作成しました');
      }
      navigate('/tests');
    } catch (error) {
      console.error('Error saving test:', error);
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
        <button onClick={() => navigate('/tests')} className="btn btn-outline-secondary btn-icon">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="h3 mb-1">{isEditing ? 'テスト編集' : '新規テスト作成'}</h1>
          <p className="text-muted mb-0">コースに対する試験を設定します。</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-4">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Test Name *</label>
            <input 
              type="text" 
              className={`form-control ${errors.test_name ? 'is-invalid' : ''}`}
              {...register('test_name', { required: 'テスト名は必須です' })}
              placeholder="e.g. Midterm Exam"
            />
            {errors.test_name && <div className="invalid-feedback">{errors.test_name.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Course *</label>
            <select 
              className={`form-select ${errors.course_id ? 'is-invalid' : ''}`}
              {...register('course_id', { required: 'コースを選択してください' })}
            >
              <option value="">Select a course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.course_name} ({c.course_code})
                </option>
              ))}
            </select>
            {errors.course_id && <div className="invalid-feedback">{errors.course_id.message}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label fw-bold small text-uppercase">Total Marks *</label>
            <input 
              type="number" 
              step="0.01"
              className={`form-control ${errors.total_marks ? 'is-invalid' : ''}`}
              {...register('total_marks', { required: '配点は必須です', valueAsNumber: true })}
              placeholder="100"
            />
            {errors.total_marks && <div className="invalid-feedback">{errors.total_marks.message}</div>}
          </div>

          <div className="col-md-3">
            <label className="form-label fw-bold small text-uppercase">Passing Marks</label>
            <input 
              type="number" 
              step="0.01"
              className="form-control"
              {...register('passing_marks', { valueAsNumber: true })}
              placeholder="60"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Test Date & Time</label>
            <input 
              type="datetime-local" 
              className="form-control"
              {...register('test_date')}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-bold small text-uppercase">Description</label>
            <textarea 
              className="form-control"
              rows={3}
              {...register('description')}
              placeholder="Test instructions or details..."
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" onClick={() => navigate('/tests')} className="btn btn-light">
            キャンセル
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary d-flex align-items-center gap-2">
            <Save size={18} />
            {loading ? '保存中...' : (isEditing ? '更新を保存' : 'テストを作成')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestForm;
