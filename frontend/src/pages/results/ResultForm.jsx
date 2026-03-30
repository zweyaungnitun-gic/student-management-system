import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { resultService } from '../../api/resultService';
import { testService } from '../../api/testService';
import { studentService } from '../../api/studentService';

const ResultForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const queryParams = new URLSearchParams(location.search);
  const defaultTestId = queryParams.get('testId');

  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsData, studentsData] = await Promise.all([
          testService.getAll(),
          studentService.getAll()
        ]);
        setTests(testsData);
        setStudents(studentsData);

        if (isEditing) {
          const result = await resultService.getById(id);
          reset({
            test_id: result.test_id,
            student_id: result.student_id,
            marks_obtained: result.marks_obtained,
            remarks: result.remarks
          });
        } else if (defaultTestId) {
          reset({ test_id: defaultTestId });
        }
      } catch (error) {
        console.error('Error fetching result data:', error);
        toast.error('データの取得に失敗しました');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, reset, defaultTestId]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        test_id: parseInt(data.test_id),
        student_id: parseInt(data.student_id),
        marks_obtained: parseFloat(data.marks_obtained),
        remarks: data.remarks
      };

      if (isEditing) {
        await resultService.update(id, payload);
        toast.success('成績を更新しました');
      } else {
        await resultService.create(payload);
        toast.success('成績を記録しました');
      }
      navigate(payload.test_id ? `/results?testId=${payload.test_id}` : '/results');
    } catch (error) {
      console.error('Error saving result:', error);
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
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-icon">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="h3 mb-1">{isEditing ? '成績編集' : '成績入力'}</h1>
          <p className="text-muted mb-0">生徒の試験スコアとフィードバックを記録します。</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-4">
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Test *</label>
            <select 
              className={`form-select ${errors.test_id ? 'is-invalid' : ''}`}
              {...register('test_id', { required: 'テストを選択してください' })}
              disabled={isEditing}
            >
              <option value="">Select a test...</option>
              {tests.map(t => (
                <option key={t.id} value={t.id}>{t.test_name}</option>
              ))}
            </select>
            {errors.test_id && <div className="invalid-feedback">{errors.test_id.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Student *</label>
            <select 
              className={`form-select ${errors.student_id ? 'is-invalid' : ''}`}
              {...register('student_id', { required: '生徒を選択してください' })}
              disabled={isEditing}
            >
              <option value="">Select a student...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.student_name} ({s.student_id})</option>
              ))}
            </select>
            {errors.student_id && <div className="invalid-feedback">{errors.student_id.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold small text-uppercase">Score Obtained *</label>
            <input 
              type="number" 
              step="0.01"
              className={`form-control ${errors.marks_obtained ? 'is-invalid' : ''}`}
              {...register('marks_obtained', { required: 'スコアは必須です', valueAsNumber: true })}
              placeholder="e.g. 85"
            />
            {errors.marks_obtained && <div className="invalid-feedback">{errors.marks_obtained.message}</div>}
          </div>

          <div className="col-12">
            <label className="form-label fw-bold small text-uppercase">Teacher Remarks</label>
            <textarea 
              className="form-control"
              rows={4}
              {...register('remarks')}
              placeholder="Enter feedback or additional notes..."
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-light">
            キャンセル
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary d-flex align-items-center gap-2">
            <Save size={18} />
            {loading ? '保存中...' : (isEditing ? '更新を保存' : '成績を保存')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResultForm;
