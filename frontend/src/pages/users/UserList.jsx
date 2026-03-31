import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { userService } from '../../api/userService';
import toast from 'react-hot-toast';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll(search);
      setUsers(response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.delete(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString();
    } catch (e) {
      return '-';
    }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      'ADMIN': { class: 'bg-danger', text: 'Admin' },
      'SUPER_ADMIN': { class: 'bg-warning', text: 'Super Admin' },
      'TEACHER': { class: 'bg-info', text: 'Teacher' },
      'GUEST': { class: 'bg-success', text: 'Guest' }
    };
    const r = roleMap[role] || { class: 'bg-secondary', text: role || '-' };
    return <span className={`badge ${r.class} rounded-pill px-3`}>{r.text}</span>;
  };

  if (loading && users.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              User Management
            </h1>
          </div>
        </div>
      </div>

      {/* Search and Add User Section */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <div className="input-group" style={{ maxWidth: '400px' }}>
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or email..."
                />
              </div>
              <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                <i className="bi bi-search"></i>
                <span>Search</span>
              </button>
              <button 
                type="button" 
                onClick={handleClear} 
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
              >
                <i className="bi bi-arrow-repeat"></i>
                <span>Refresh</span>
              </button>
            </form>
            
            <div>
              <button
                className="btn btn-success d-flex align-items-center gap-2"
                onClick={() => navigate('/users/new')}
              >
                <Plus size={16} />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
            <span>No users registered.</span>
            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/users/new')}
              >
                <Plus size={16} className="me-2" />
                Add Your First User
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="text-center" style={{ minWidth: '60px' }}>ID</th>
                    <th className="text-center" style={{ minWidth: '120px' }}>User ID</th>
                    <th style={{ minWidth: '150px' }}>Name</th>
                    <th style={{ minWidth: '200px' }}>Email</th>
                    <th className="text-center" style={{ minWidth: '100px' }}>Role</th>
                    <th className="text-center" style={{ minWidth: '140px' }}>Created Date</th>
                    <th className="text-center" style={{ minWidth: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="text-center">{user.id}</td>
                      <td className="text-center">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                          {user.user_id || user.userId}
                        </span>
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td className="text-center">{getRoleBadge(user.role)}</td>
                      <td className="text-center">{formatDate(user.created_at || user.createdAt)}</td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button
                            className="action-icon-link text-primary"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="action-icon-link text-danger"
                            onClick={() => handleDelete(user.id)}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;