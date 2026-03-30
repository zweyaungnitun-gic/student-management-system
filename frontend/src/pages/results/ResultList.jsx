import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resultService } from '../../api/resultService';
import toast from 'react-hot-toast';

const ResultList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterTestId = queryParams.get('testId');
  const filterStudentId = queryParams.get('studentId');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      setLoading(true);
      let data;
      if (filterTestId) {
        data = await resultService.getByTest(filterTestId);
      } else if (filterStudentId) {
        data = await resultService.getByStudent(filterStudentId);
      } else {
        // Fallback or generic fetch if needed
        data = [];
      }
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('成績一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [filterTestId, filterStudentId]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('この成績データを削除してもよろしいですか？')) {
      try {
        await resultService.delete(id);
        toast.success('削除しました');
        fetchResults();
      } catch (error) {
        toast.error('削除に失敗しました');
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            {(filterTestId || filterStudentId) && (
              <button onClick={() => navigate(-1)} className="btn btn-light btn-icon rounded-circle shadow-sm">
                <i className="bi bi-arrow-left"></i>
              </button>
            )}
            <div>
              <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
                成績管理
              </h1>
              <div className="text-muted small mt-1">
                {filterTestId ? `テストID: ${filterTestId} の結果を表示中` : 
                 filterStudentId ? `生徒ID: ${filterStudentId} の結果を表示中` : 
                 '生徒の試験結果を表示・管理します。'}
              </div>
            </div>
          </div>
          <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" 
            onClick={() => navigate('/results/new')}
            style={{ backgroundColor: '#0b5ed7', border: 'none' }}>
            <i className="bi bi-plus-lg"></i>
            <span>成績登録</span>
          </button>
        </div>
      </div>

      {!filterTestId && !filterStudentId && results.length === 0 && (
        <div className="alert alert-info border-0 shadow-sm mb-4">
          <i className="bi bi-info-circle-fill me-2"></i>
          テスト管理または生徒一覧から特定の成績を表示することをお勧めします。
        </div>
      )}

      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-center py-3" style={{ width: '60px', background: '#0b5ed7', color: 'white' }}>ID</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>生徒名</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>テスト名</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>得点</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>評価</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>GPA</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>判定</th>
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
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">成績データが見つかりません。</td>
                  </tr>
                ) : (
                  results.map(r => (
                    <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/results/${r.id}/edit`)}>
                      <td className="text-center">{r.id}</td>
                      <td className="fw-medium">{r.student_name}</td>
                      <td className="fw-medium">{r.test_name}</td>
                      <td className="text-center fw-bold">
                        {r.marks_obtained} <span className="text-muted fw-normal">/ {r.weightage || 100}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border px-3 py-1 fw-bold">{r.grade}</span>
                      </td>
                      <td className="text-center text-primary fw-bold">{r.gpa || '-'}</td>
                      <td className="text-center">
                        <span className={`badge px-3 py-2 rounded-pill fw-bold ${
                          r.status === 'PASS' ? 'bg-success text-white' : 'bg-danger text-white'
                        }`}>
                          {r.status === 'PASS' ? '合格' : '不合格'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button className="border-0 bg-transparent text-primary p-0" title="編集"
                            onClick={(e) => { e.stopPropagation(); navigate(`/results/${r.id}/edit`); }}>
                            <i className="bi bi-pencil-square" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button className="border-0 bg-transparent text-danger p-0" title="削除"
                            onClick={(e) => handleDelete(e, r.id)}>
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

export default ResultList;
