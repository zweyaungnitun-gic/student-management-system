import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentService } from '../../api/studentService';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      toast.error('生徒データの取得に失敗しました');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`本当に ${name} を削除しますか？`)) {
      try {
        await studentService.delete(id);
        toast.success(`${name} を削除しました`);
        fetchStudents();
      } catch (error) {
        toast.error(`削除に失敗しました`);
      }
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(students.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedIds, id];
      setSelectedIds(newSelected);
      if (newSelected.length === students.length) setSelectAll(true);
    }
  };

  const filteredStudents = students.filter(s => 
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header mb-3">
        <div className="d-flex align-items-center gap-3">
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              生徒情報一覧画面
            </h1>
          </div>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-primary btn-sm px-3" onClick={() => navigate('/students/new')}>
              <i className="bi bi-person-plus-fill me-2"></i>生徒追加
            </button>
            <button className="btn btn-outline-primary btn-sm px-3" onClick={() => navigate('/teachers')}>
              <i className="bi bi-people-fill me-2"></i>教師管理
            </button>
          </div>
        </div>
      </div>

      <div className="table-wrapper p-1">
        <div className="table-responsive">
          <table className="table data-table align-middle border">
            <thead>
              <tr className="filter-row">
                <th colSpan="9" className="p-3">
                  <div className="d-flex align-items-center gap-4 flex-wrap">
                    <div className="filter-control-group">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <span className="small fw-bold">全て選択</span>
                    </div>
                    
                    <div className="filter-control-group">
                      <span className="small fw-bold">名前で検索</span>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder="名前を入力..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '180px' }}
                      />
                    </div>

                    <div className="ms-auto">
                      <button className="btn btn-primary btn-sm px-3" style={{ background: '#0b5ed7' }}>
                        <i className="bi bi-download me-2"></i>ダウンロード
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
              <tr>
                <th style={{ width: '80px' }}>生徒ID</th>
                <th>名前</th>
                <th style={{ width: '80px' }}>性別</th>
                <th>電話番号</th>
                <th>希望職種</th>
                <th style={{ width: '100px' }}>ステータス</th>
                <th>支払予定日</th>
                <th>支払実績日</th>
                <th style={{ width: '130px' }}>動作機能</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">生徒情報がありません。</td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr key={s.id} onClick={() => navigate(`/students/${s.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="id-cell">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <input 
                          type="checkbox" 
                          className="form-check-input row-checkbox" 
                          checked={selectedIds.includes(s.id)}
                          onChange={(e) => handleSelectRow(e, s.id)}
                        />
                        <span className="fw-bold text-primary">{s.student_id}</span>
                      </div>
                    </td>
                    <td>{s.student_name}</td>
                    <td>{s.gender || '—'}</td>
                    <td>{s.phone_number || '—'}</td>
                    <td>{s.desired_job_type || '—'}</td>
                    <td>
                      <span className={`badge rounded-pill ${s.registration_status === 'ACCEPTED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {s.registration_status === 'ACCEPTED' ? '在校' : s.registration_status}
                      </span>
                    </td>
                    <td>{s.schedule_payment_date ? new Date(s.schedule_payment_date).toLocaleDateString() : '—'}</td>
                    <td>{s.actual_payment_date ? new Date(s.actual_payment_date).toLocaleDateString() : '—'}</td>
                    <td className="action-cell">
                      <div className="d-flex justify-content-center gap-3">
                        <button className="border-0 bg-transparent text-info p-0" title="詳細" onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }}>
                          <i className="bi bi-info-circle"></i>
                        </button>
                        <button className="border-0 bg-transparent text-primary p-0" title="編集" onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}/edit`); }}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="border-0 bg-transparent text-success p-0" title="成績" onClick={(e) => { e.stopPropagation(); navigate(`/results?studentId=${s.id}`); }}>
                          <i className="bi bi-bar-chart-fill"></i>
                        </button>
                        <button className="border-0 bg-transparent text-danger p-0" title="削除" onClick={(e) => handleDelete(e, s.id, s.student_name)}>
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div id="pagination" className="d-flex justify-content-center mt-3">
          {/* Pagination logic would go here, kept as placeholder to match template */}
        </div>
      </div>
    </div>
  );
};

export default StudentList;
