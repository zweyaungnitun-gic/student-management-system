// frontend/src/pages/users/UserList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Users, Shield, UserCog, User, Download } from 'lucide-react';
import { userService } from '../../api/userService';
import toast from 'react-hot-toast';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all'); // all, SUPER_ADMIN, ADMIN, TEACHER, GUEST
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      let data = response || [];
      
      // Apply role filter if needed
      if (roleFilter !== 'all') {
        data = data.filter(user => user.role === roleFilter);
      }
      
      setUsers(data);
      setCurrentPage(1);
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
  }, [roleFilter]);

  const handleViewDetails = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDelete = async (e, userId, username) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      try {
        await userService.delete(userId);
        toast.success(`User "${username}" deleted successfully`);
        fetchUsers();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      const newSelected = selectedIds.filter(i => i !== id);
      setSelectedIds(newSelected);
      setSelectAll(newSelected.length === filteredUsers.length && filteredUsers.length > 0);
    } else {
      const newSelected = [...selectedIds, id];
      setSelectedIds(newSelected);
      setSelectAll(newSelected.length === filteredUsers.length);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No users selected');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected user(s)?`)) {
      try {
        let successCount = 0;
        let failCount = 0;
        
        for (const id of selectedIds) {
          try {
            await userService.delete(id);
            successCount++;
          } catch {
            failCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} user(s) deleted successfully`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} user(s) failed to delete`);
        }
        
        fetchUsers();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        toast.error('Bulk delete failed');
      }
    }
  };

  const handleDownloadCSV = () => {
    try {
      const headers = [
        'User ID',
        'Username',
        'Email',
        'Role',
        'School/Organization',
        'Created Date'
      ];

      const selectedUsers = users.filter(u => selectedIds.includes(u.id));
      const usersToExport = selectedIds.length > 0 ? selectedUsers : users;
      
      if (usersToExport.length === 0) {
        toast.error('No users to export');
        return;
      }

      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const user of usersToExport) {
        const row = [
          `"${user.user_id || user.userId || ''}"`,
          `"${user.username || ''}"`,
          `"${user.email || ''}"`,
          `"${user.role || ''}"`,
          `"${(user.school_name || user.schoolName || '').replace(/"/g, '""')}"`,
          `"${user.created_at || user.createdAt || ''}"`
        ];
        csvRows.push(row.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${usersToExport.length} user(s)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export users');
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.user_id || u.userId)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRoleBadge = (role) => {
    const roleConfig = {
      'SUPER_ADMIN': { class: 'super-admin', icon: <Shield size={12} />, label: 'Super Admin' },
      'ADMIN': { class: 'admin', icon: <UserCog size={12} />, label: 'Admin' },
      'TEACHER': { class: 'teacher', icon: <User size={12} />, label: 'Teacher' },
      'GUEST': { class: 'guest', icon: <User size={12} />, label: 'Guest' }
    };
    const config = roleConfig[role] || { class: 'default', icon: <User size={12} />, label: role || 'Unknown' };
    
    return (
      <span className={`role-badge ${config.class}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '-';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Statistics
  const superAdminCount = users.filter(u => u.role === 'SUPER_ADMIN').length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const teacherCount = users.filter(u => u.role === 'TEACHER').length;
  const guestCount = users.filter(u => u.role === 'GUEST').length;

  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-module">
      {/* Header Section */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <Users size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">User Management</h1>
            <p className="header-subtitle">Manage system users, roles, and access permissions</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <h3>{superAdminCount}</h3>
            <p>Super Admins</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <UserCog size={24} />
          </div>
          <div className="stat-info">
            <h3>{adminCount}</h3>
            <p>Admins</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <User size={24} />
          </div>
          <div className="stat-info">
            <h3>{teacherCount}</h3>
            <p>Teachers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <User size={24} />
          </div>
          <div className="stat-info">
            <h3>{guestCount}</h3>
            <p>Guests</p>
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="stat-card selected">
            <div className="stat-icon purple">
              <span>{selectedIds.length}</span>
            </div>
            <div className="stat-info">
              <h3>Selected</h3>
              <p>{selectedIds.length} user(s)</p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Action Bar */}
      <div className="action-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by username, email, or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="action-buttons">
          {/* Role Filter Dropdown */}
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="GUEST">Guest</option>
          </select>
          
          {selectedIds.length > 0 && (
            <>
              <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                <Trash2 size={16} />
                <span>Delete ({selectedIds.length})</span>
              </button>
              <button className="btn-download" onClick={handleDownloadCSV}>
                <Download size={16} />
                <span>Download Selected</span>
              </button>
            </>
          )}
          <button className="btn-download-all" onClick={() => handleDownloadCSV()}>
            <Download size={16} />
            <span>Download All</span>
          </button>
          <button className="btn-add" onClick={() => navigate('/users/new')}>
            <Plus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      {paginatedUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>Try adjusting your search or filters, or add a new user.</p>
          <button className="btn-add-primary" onClick={() => navigate('/users/new')}>
            <Plus size={18} />
            <span>Add Your First User</span>
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>School/Organization</th>
                  <th className="text-center">Created Date</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => {
                  const userId = user.id;
                  const userCode = user.user_id || user.userId;
                  const username = user.username;
                  const email = user.email;
                  const role = user.role;
                  const schoolName = user.school_name || user.schoolName;
                  
                  return (
                    <tr key={userId}>
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(userId)}
                          onChange={(e) => handleSelectRow(e, userId)}
                        />
                      </td>
                      <td className="user-id-cell">
                        <span className="user-id-badge">
                          {userCode}
                        </span>
                      </td>
                      <td className="username-cell">
                        <div className="username-info">
                          <div className="user-avatar">
                            {getInitials(username)}
                          </div>
                          <span>{username}</span>
                        </div>
                      </td>
                      <td className="email-cell">
                        <a href={`mailto:${email}`} className="email-link">
                          {email}
                        </a>
                      </td>
                      <td className="role-cell">
                        {getRoleBadge(role)}
                      </td>
                      <td>
                        <span className="school-name">{schoolName || '-'}</span>
                      </td>
                      <td className="text-center">{formatDate(user.created_at || user.createdAt)}</td>
                      <td className="actions-col">
                        <div className="action-icons">
                          <button
                            className="icon-btn edit"
                            onClick={() => handleViewDetails(userId)}
                            title="Edit User"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={(e) => handleDelete(e, userId, username)}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="page-info">
                Page {currentPage} of {totalPages}
              </div>
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          
          <div className="table-footer">
            <span className="showing-info">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </span>
            <span className="selected-info">
              {selectedIds.length} user(s) selected
            </span>
          </div>
        </>
      )}

      <style>{`
        .user-list-module {
          padding: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .module-header {
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 24px;
          padding: 2rem;
          margin-bottom: 2rem;
          color: white;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .header-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
        }

        .header-subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .stats-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .stat-card {
          background: white;
          border-radius: 20px;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          flex: 1;
          min-width: 150px;
        }

        .stat-card.selected {
          background: #e3f2fd;
          border: 1px solid #0f6cbd;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }
        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.orange { background: #fff3e0; color: #ed6c02; }

        .stat-info h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .stat-info p {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .search-wrapper {
          flex: 1;
          max-width: 350px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 2rem 0.75rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #0f6cbd;
          box-shadow: 0 0 0 3px rgba(15, 108, 189, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-select {
          padding: 0.6rem 2rem 0.6rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
        }

        .btn-add, .btn-download, .btn-download-all, .btn-bulk-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-add {
          background: #10b981;
          color: white;
        }

        .btn-add:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .btn-download, .btn-download-all {
          background: white;
          border: 1px solid #0f6cbd;
          color: #0f6cbd;
        }

        .btn-download:hover, .btn-download-all:hover {
          background: #e3f2fd;
        }

        .btn-bulk-delete {
          background: #dc2626;
          color: white;
        }

        .btn-bulk-delete:hover {
          background: #b91c1c;
        }

        .table-container {
          background: white;
          border-radius: 20px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
        }

        .users-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .users-table tr:hover {
          background: #f8fafc;
        }

        .checkbox-col {
          width: 40px;
          text-align: center;
        }

        .checkbox-col input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .user-id-cell .user-id-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 0.75rem;
          font-family: monospace;
          color: #475569;
        }

        .username-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #0f6cbd 0%, #1e88e5 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .email-cell .email-link {
          color: #0f6cbd;
          text-decoration: none;
          font-size: 0.85rem;
        }

        .email-cell .email-link:hover {
          text-decoration: underline;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .role-badge.super-admin {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .role-badge.admin {
          background: #e3f2fd;
          color: #1976d2;
        }

        .role-badge.teacher {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .role-badge.guest {
          background: #fff3e0;
          color: #ed6c02;
        }

        .role-badge.default {
          background: #e2e8f0;
          color: #475569;
        }

        .school-name {
          font-size: 0.85rem;
          color: #334155;
        }

        .actions-col {
          width: 80px;
          text-align: center;
        }

        .action-icons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .icon-btn {
          padding: 0.5rem;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .icon-btn.edit { color: #f59e0b; }
        .icon-btn.edit:hover { background: #fef3c7; }
        .icon-btn.delete { color: #dc2626; }
        .icon-btn.delete:hover { background: #fee2e2; }

        .text-center {
          text-align: center;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .page-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-btn:not(:disabled):hover {
          background: #f1f5f9;
          border-color: #0f6cbd;
        }

        .page-info {
          font-size: 0.85rem;
          color: #64748b;
        }

        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding: 0.5rem 0;
          font-size: 0.8rem;
          color: #64748b;
        }

        .showing-info, .selected-info {
          background: #f8fafc;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 24px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }

        .empty-state p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }

        .btn-add-primary {
          padding: 0.75rem 1.5rem;
          background: #0f6cbd;
          color: white;
          border: none;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-add-primary:hover {
          background: #0a58a0;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #0f6cbd;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .user-list-module {
            padding: 1rem;
          }
          
          .module-header {
            padding: 1.5rem;
          }
          
          .header-content {
            flex-direction: column;
            text-align: center;
          }
          
          .action-bar {
            flex-direction: column;
          }
          
          .search-wrapper {
            max-width: 100%;
          }
          
          .action-buttons {
            width: 100%;
            justify-content: stretch;
          }
          
          .action-buttons button,
          .action-buttons select {
            flex: 1;
            justify-content: center;
          }
          
          .table-footer {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UserList;