import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../api/userService';
import toast from 'react-hot-toast';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`${name}を削除してもよろしいですか？`)) {
      try {
        await userService.delete(id);
        toast.success('削除しました');
        fetchUsers();
      } catch (error) {
        toast.error('削除に失敗しました');
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
            ユーザー一覧
          </h1>
        </div>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="p-3 border-bottom bg-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex gap-2">
                <div className="input-group" style={{ maxWidth: '400px' }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0" 
                    placeholder="ユーザー名、メールで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary px-4 d-flex align-items-center gap-2" style={{ backgroundColor: '#0b5ed7', border: 'none' }}>
                  <i className="bi bi-search"></i>
                  <span>検索</span>
                </button>
              </div>
              
              <button className="btn btn-success px-4 d-flex align-items-center gap-2" 
                onClick={() => navigate('/users/new')}
                style={{ backgroundColor: '#198754', border: 'none' }}>
                <i className="bi bi-person-plus-fill"></i>
                <span>ユーザー追加</span>
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-primary text-white" style={{ backgroundColor: '#0b5ed7 !important' }}>
                <tr>
                  <th className="text-center py-3" style={{ width: '60px', background: '#0b5ed7', color: 'white' }}>ID</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>ユーザーID</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>名前</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>学校名</th>
                  <th className="py-3" style={{ background: '#0b5ed7', color: 'white' }}>メール</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>ロール</th>
                  <th className="text-center py-3" style={{ background: '#0b5ed7', color: 'white' }}>作成日</th>
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
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">ユーザーが登録されていません。</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/users/${u.id}/edit`)}>
                      <td className="text-center">{u.id}</td>
                      <td className="text-center">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-medium">
                          {u.user_id}
                        </span>
                      </td>
                      <td className="fw-medium">{u.username}</td>
                      <td>{u.school_name || '-'}</td>
                      <td>{u.email}</td>
                      <td className="text-center">
                        <span className={`badge px-3 py-2 rounded-pill fw-medium ${
                          u.role === 'ADMIN' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'
                        }`}>
                          {u.role === 'ADMIN' ? '管理者' : 'ゲスト'}
                        </span>
                      </td>
                      <td className="text-center small text-muted">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button className="border-0 bg-transparent text-primary p-0" title="編集"
                            onClick={(e) => { e.stopPropagation(); navigate(`/users/${u.id}/edit`); }}>
                            <i className="bi bi-pencil-square" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button className="border-0 bg-transparent text-danger p-0" title="削除"
                            onClick={(e) => handleDelete(e, u.id, u.username)}>
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
          <div className="p-3 border-top d-flex justify-content-center">
            {/* Pagination Placeholder */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
