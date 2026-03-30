import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationService } from '../../api/registrationService';
import toast from 'react-hot-toast';

const RegistrationList = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING'); // Default to PENDING
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      // Backend handles status filtering if we pass it, but for now we filter frontend 
      // based on the data we have or we can modify the service to accept status.
      const data = await registrationService.getAll();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('登録申請の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleAction = async (e, id, action) => {
    e.stopPropagation();
    try {
      if (action === 'accept') {
        await registrationService.accept(id);
        toast.success('申請を承認しました');
      } else {
        await registrationService.reject(id);
        toast.success('申請を却下しました');
      }
      fetchRegistrations();
    } catch (error) {
      toast.error('アクションに失敗しました');
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesStatus = r.registration_status === statusFilter;
    const matchesSearch = r.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.registration_code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fade-in">
      <div className="page-header mb-3">
        <div className="d-flex align-items-center gap-3">
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              登録申請一覧
            </h1>
            <div className="text-muted small mt-1">学生が登録フォームから送信した申請を承認 / 却下します。</div>
          </div>
          <div className="ms-auto">
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => navigate('/students')}>
              <i className="bi bi-arrow-left me-1"></i> 生徒一覧へ戻る
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrapper p-1">
        <div className="table-responsive">
          <table className="table data-table align-middle border">
            <thead>
              <tr className="filter-row">
                <th colSpan="7" className="p-3">
                  <div className="d-flex align-items-center gap-5 flex-wrap">
                    <div className="filter-control-group d-flex flex-column align-items-start gap-1">
                      <span className="small fw-bold text-muted text-uppercase">ステータス</span>
                      <div className="d-flex gap-3">
                        {['PENDING', 'ACCEPTED', 'REJECTED'].map(status => (
                          <label key={status} className="form-check form-check-inline mb-0" style={{ cursor: 'pointer' }}>
                            <input 
                              type="radio" 
                              className="form-check-input" 
                              name="status"
                              checked={statusFilter === status}
                              onChange={() => setStatusFilter(status)}
                            />
                            <span className="form-check-label small fw-semibold text-dark">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="filter-control-group d-flex flex-column align-items-start gap-1">
                      <span className="small fw-bold text-muted text-uppercase">名前で検索</span>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder="名前を入力..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '200px' }}
                      />
                    </div>

                    <div className="ms-auto d-flex gap-2 align-self-end">
                      <button className="btn btn-outline-danger btn-sm px-3" onClick={() => { setSearchTerm(''); setStatusFilter('PENDING'); }}>
                        <i className="bi bi-x-circle me-1"></i> クリア
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
              <tr>
                <th>申請ID</th>
                <th>氏名</th>
                <th>性別</th>
                <th>電話番号</th>
                <th>国民ID</th>
                <th>申請日</th>
                <th className="text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">該当する登録申請はありません。</td>
                </tr>
              ) : (
                filteredRegistrations.map(r => (
                  <tr key={r.id} onClick={() => navigate(`/registrations/${r.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="fw-bold text-primary">{r.registration_code}</div>
                      <div className="small text-muted">{r.registration_status}</div>
                    </td>
                    <td className="fw-medium">{r.english_name}</td>
                    <td>{r.gender || '—'}</td>
                    <td>{r.phone_number || '—'}</td>
                    <td className="small">{r.national_id_number || '—'}</td>
                    <td>{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : '—'}</td>
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      {r.registration_status === 'PENDING' ? (
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-success btn-sm px-3 d-flex align-items-center gap-1"
                            onClick={(e) => handleAction(e, r.id, 'accept')}>
                            <i className="bi bi-check-lg"></i> 承認
                          </button>
                          <button className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center gap-1"
                            onClick={(e) => handleAction(e, r.id, 'reject')}>
                            <i className="bi bi-x-lg"></i> 却下
                          </button>
                        </div>
                      ) : (
                        <div className="small fw-bold">
                          {r.registration_status === 'ACCEPTED' ? (
                            <span className="text-success">承認済 {r.student_id ? `(ID: ${r.student_id})` : ''}</span>
                          ) : (
                            <span className="text-danger">却下済</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistrationList;
