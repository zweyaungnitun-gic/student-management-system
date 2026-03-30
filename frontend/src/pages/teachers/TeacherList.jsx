import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../api/teacherService';
import toast from 'react-hot-toast';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('教師一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('この教師を削除してもよろしいですか？')) {
      try {
        await teacherService.delete(id);
        toast.success('削除しました');
        fetchTeachers();
      } catch (error) {
        toast.error('削除に失敗しました');
      }
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.teacher_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
            教師管理
          </h1>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2 flex-grow-1" style={{ maxWidth: '600px' }}>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text" 
              className="form-control" 
              placeholder="教師名、メール、IDで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary px-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#0b5ed7', border: 'none' }}>
            <i className="bi bi-search"></i>
            <span>検索</span>
          </button>
          <button className="btn btn-outline-secondary px-4 d-flex align-items-center gap-2" onClick={() => setSearchTerm('')}>
            <i className="bi bi-arrow-repeat"></i>
            <span>リフレッシュ</span>
          </button>
        </div>
        <button className="btn btn-success px-4 py-2 d-flex align-items-center gap-2" 
          onClick={() => navigate('/teachers/new')}
          style={{ backgroundColor: '#198754', border: 'none' }}>
          <i className="bi bi-plus-circle"></i>
          <span>新規教師追加</span>
        </button>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-center py-3" style={{ width: '60px', background: '#0b5ed7', color: 'white' }}>ID</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>教師ID</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>氏名</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>メールアドレス</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>学部/学科</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>ステータス</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>登録日</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">教師が登録されていません。</td>
                  </tr>
                ) : (
                  filteredTeachers.map(t => (
                    <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/teachers/${t.id}`)}>
                      <td className="text-center">{t.id}</td>
                      <td className="text-center">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-medium">
                          {t.teacher_id}
                        </span>
                      </td>
                      <td className="fw-medium">{t.name}</td>
                      <td>{t.email}</td>
                      <td>{t.department || '-'}</td>
                      <td className="text-center">
                        <span className={`badge px-3 py-2 rounded-pill fw-medium ${
                          t.is_active ? 'bg-success text-white' : 'bg-danger text-white'
                        }`}>
                          {t.is_active ? 'アクティブ' : '非アクティブ'}
                        </span>
                      </td>
                      <td className="text-center small text-muted">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button className="border-0 bg-transparent text-primary p-0" title="編集"
                            onClick={(e) => { e.stopPropagation(); navigate(`/teachers/${t.id}/edit`); }}>
                            <i className="bi bi-pencil-square" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button className="border-0 bg-transparent text-info p-0" title="詳細"
                            onClick={(e) => { e.stopPropagation(); navigate(`/teachers/${t.id}`); }}>
                            <i className="bi bi-info-circle" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button className="border-0 bg-transparent text-danger p-0" title="削除"
                            onClick={(e) => handleDelete(e, t.id)}>
                            <i className="bi bi-trash-fill" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherList;
