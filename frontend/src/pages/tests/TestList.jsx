import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../api/testService';
import toast from 'react-hot-toast';

const TestList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTests = async () => {
    try {
      setLoading(true);
      const data = await testService.getAll();
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('テスト一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`${name}を削除してもよろしいですか？`)) {
      try {
        await testService.delete(id);
        toast.success('削除しました');
        fetchTests();
      } catch (error) {
        toast.error('削除に失敗しました');
      }
    }
  };

  const filteredTests = tests.filter(t => 
    t.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              テスト管理
            </h1>
          </div>
          <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" 
            onClick={() => navigate('/tests/new')}
            style={{ backgroundColor: '#0b5ed7', border: 'none' }}>
            <i className="bi bi-plus-lg"></i>
            <span>テスト作成</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4" style={{ maxWidth: '500px' }}>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <i className="bi bi-search"></i>
          </span>
          <input 
            type="text" 
            className="form-control" 
            placeholder="テスト名またはコース名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-center py-3" style={{ width: '60px', background: '#0b5ed7', color: 'white' }}>ID</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>テスト名</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>コース</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>満点</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>合格点</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>実施日</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </td>
                  </tr>
                ) : filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">テストが登録されていません。</td>
                  </tr>
                ) : (
                  filteredTests.map(t => (
                    <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tests/${t.id}/edit`)}>
                      <td className="text-center">{t.id}</td>
                      <td className="fw-bold text-primary">{t.test_name}</td>
                      <td>{t.course_name}</td>
                      <td className="text-center fw-medium">{t.total_marks}</td>
                      <td className="text-center fw-medium text-success">{t.passing_marks}</td>
                      <td className="text-center small text-muted">
                        {t.test_date ? new Date(t.test_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button className="border-0 bg-transparent text-success p-0" title="成績を表示"
                            onClick={(e) => { e.stopPropagation(); navigate(`/results?testId=${t.id}`); }}>
                            <i className="bi bi-file-earmark-spreadsheet" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button className="border-0 bg-transparent text-primary p-0" title="編集"
                            onClick={(e) => { e.stopPropagation(); navigate(`/tests/${t.id}/edit`); }}>
                            <i className="bi bi-pencil-square" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button className="border-0 bg-transparent text-danger p-0" title="削除"
                            onClick={(e) => handleDelete(e, t.id, t.test_name)}>
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

export default TestList;
