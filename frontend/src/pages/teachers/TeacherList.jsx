import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, PlayCircle, PauseCircle, Download, ChevronLeft, ChevronRight, Users, Search, X } from 'lucide-react';
import { teacherService } from '../../api/teacherService';
import toast from 'react-hot-toast';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll();
      setTeachers(response || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleViewDetails = (teacherId) => {
    navigate(`/teachers/${teacherId}`);
  };

  const handleToggleActive = async (teacherId, isActive) => {
    try {
      if (isActive) {
        await teacherService.deactivate(teacherId);
        toast.success('Teacher deactivated successfully');
      } else {
        await teacherService.activate(teacherId);
        toast.success('Teacher activated successfully');
      }
      fetchTeachers();
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (e, teacherId, teacherName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${teacherName}"? This action cannot be undone.`)) {
      try {
        await teacherService.delete(teacherId);
        toast.success(`Teacher "${teacherName}" deleted successfully`);
        fetchTeachers();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        console.error('Error deleting teacher:', error);
        toast.error(error.response?.data?.detail || 'Delete failed');
      }
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(filteredTeachers.map(t => t.teacher_id || t.teacherId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      const newSelected = selectedIds.filter(i => i !== id);
      setSelectedIds(newSelected);
      setSelectAll(newSelected.length === filteredTeachers.length && filteredTeachers.length > 0);
    } else {
      const newSelected = [...selectedIds, id];
      setSelectedIds(newSelected);
      setSelectAll(newSelected.length === filteredTeachers.length);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No teachers selected');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected teacher(s)?`)) {
      try {
        let successCount = 0;
        let failCount = 0;
        
        for (const id of selectedIds) {
          try {
            await teacherService.delete(id);
            successCount++;
          } catch {
            failCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} teacher(s) deleted successfully`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} teacher(s) failed to delete`);
        }
        
        fetchTeachers();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        toast.error('Bulk delete failed');
      }
    }
  };

  const handleBulkStatusUpdate = async (activate) => {
    if (selectedIds.length === 0) {
      toast.error('No teachers selected');
      return;
    }
    
    const action = activate ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${action} ${selectedIds.length} selected teacher(s)?`)) {
      try {
        let successCount = 0;
        let failCount = 0;
        
        for (const id of selectedIds) {
          try {
            if (activate) {
              await teacherService.activate(id);
            } else {
              await teacherService.deactivate(id);
            }
            successCount++;
          } catch {
            failCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} teacher(s) ${action}d successfully`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} teacher(s) failed to ${action}`);
        }
        
        fetchTeachers();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        toast.error(`Bulk ${action} failed`);
      }
    }
  };

  const handleDownloadCSV = () => {
    try {
      const headers = [
        'Teacher ID',
        'Name',
        'Email',
        'Department',
        'Status',
        'Created Date'
      ];

      const selectedTeachers = teachers.filter(t => selectedIds.includes(t.teacher_id || t.teacherId));
      const teachersToExport = selectedIds.length > 0 ? selectedTeachers : teachers;
      
      if (teachersToExport.length === 0) {
        toast.error('No teachers to export');
        return;
      }

      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const teacher of teachersToExport) {
        const row = [
          `"${teacher.teacher_code || teacher.teacherCode || ''}"`,
          `"${teacher.name || ''}"`,
          `"${teacher.email || ''}"`,
          `"${teacher.department || ''}"`,
          `"${teacher.is_active ? 'Active' : 'Inactive'}"`,
          `"${teacher.created_at || teacher.createdAt || ''}"`
        ];
        csvRows.push(row.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `teachers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${teachersToExport.length} teacher(s)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export teachers');
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.teacher_code || t.teacherCode)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeachers = filteredTeachers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <span className="status-badge success"><span className="status-dot"></span>Active</span>;
    }
    return <span className="status-badge danger"><span className="status-dot"></span>Inactive</span>;
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

  if (loading && teachers.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-list-module">
      {/* Header */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <Users size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Teacher Management</h1>
            <p className="header-subtitle">Manage faculty and staff records, track assignments, and monitor performance</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{teachers.length}</h3>
            <p>Total Teachers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <PlayCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{teachers.filter(t => t.is_active).length}</h3>
            <p>Active Teachers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <PauseCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{teachers.filter(t => !t.is_active).length}</h3>
            <p>Inactive Teachers</p>
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="stat-card selected">
            <div className="stat-icon purple">
              <span>{selectedIds.length}</span>
            </div>
            <div className="stat-info">
              <h3>Selected</h3>
              <p>{selectedIds.length} teacher(s)</p>
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
            placeholder="Search by name, email, or ID..."
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
          {selectedIds.length > 0 && (
            <>
              <button className="btn-bulk-active" onClick={() => handleBulkStatusUpdate(true)}>
                <PlayCircle size={16} />
                <span>Activate ({selectedIds.length})</span>
              </button>
              <button className="btn-bulk-inactive" onClick={() => handleBulkStatusUpdate(false)}>
                <PauseCircle size={16} />
                <span>Deactivate ({selectedIds.length})</span>
              </button>
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
          <button className="btn-add" onClick={() => navigate('/teachers/new')}>
            <Plus size={16} />
            <span>Add Teacher</span>
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      {paginatedTeachers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👩‍🏫</div>
          <h3>No teachers found</h3>
          <p>Try adjusting your search or add a new teacher.</p>
          <button className="btn-add-primary" onClick={() => navigate('/teachers/new')}>
            <Plus size={18} />
            <span>Add Your First Teacher</span>
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="teachers-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredTeachers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Teacher ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Joined Date</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTeachers.map(teacher => {
                  const teacherId = teacher.teacher_id || teacher.teacherId;
                  return (
                    <tr key={teacherId}>
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(teacherId)}
                          onChange={(e) => handleSelectRow(e, teacherId)}
                        />
                       </td>
                      <td className="teacher-id-cell">
                        <span className="teacher-code-badge">
                          {teacher.teacher_code || teacher.teacherCode}
                        </span>
                       </td>
                      <td className="teacher-name-cell">
                        <div className="teacher-name-info">
                          <div className="teacher-avatar">
                            {getInitials(teacher.name)}
                          </div>
                          <span>{teacher.name}</span>
                        </div>
                       </td>
                      <td className="teacher-email-cell">
                        <a href={`mailto:${teacher.email}`} className="email-link">
                          {teacher.email}
                        </a>
                       </td>
                      <td>{teacher.department || '-'}</td>
                      <td className="text-center">
                        {getStatusBadge(teacher.is_active)}
                       </td>
                      <td className="text-center">{formatDate(teacher.created_at || teacher.createdAt)}</td>
<td className="text-center">
  <div className="action-buttons">
    <button
      className="action-icon-btn view"
      onClick={() => handleViewDetails(teacher.teacher_id || teacher.teacherId)}
      title="View Details"
    >
      <Eye size={16} />
    </button>
    <button
      className="action-icon-btn edit"
      onClick={() => navigate(`/teachers/${teacher.teacher_id || teacher.teacherId}/edit`)}
      title="Edit"
    >
      <Pencil size={16} />
    </button>
    {teacher.is_active ? (
      <button
        className="action-icon-btn deactivate"
        onClick={() => handleToggleActive(teacher.teacher_id || teacher.teacherId, true)}
        title="Deactivate"
      >
        <PauseCircle size={16} />
      </button>
    ) : (
      <button
        className="action-icon-btn activate"
        onClick={() => handleToggleActive(teacher.teacher_id || teacher.teacherId, false)}
        title="Activate"
      >
        <PlayCircle size={16} />
      </button>
    )}
    <button
      className="action-icon-btn delete"
      onClick={() => handleDelete(teacher.teacher_id || teacher.teacherId, teacher.name)}
      title="Delete"
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length} teachers
            </span>
            <span className="selected-info">
              {selectedIds.length} teacher(s) selected
            </span>
          </div>
        </>
      )}

      <style>{`
        .teacher-list-module {
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

        .stat-icon.blue { background: #e3f2fd; color: #1976d2; }
        .stat-icon.green { background: #e8f5e9; color: #2e7d32; }
        .stat-icon.orange { background: #fff3e0; color: #ed6c02; }
        .stat-icon.purple { background: #f3e5f5; color: #7b1fa2; }

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
          gap: 0.85rem; 
          justify-content: center;
        }

        .action-icon-btn {
          background: transparent !important;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-icon-btn:hover {
          transform: scale(1.2); 
          opacity: 0.8;
        }

        .action-icon-btn.view { color: #0f6cbd; }
        .action-icon-btn.edit { color: #f59e0b; }
        .action-icon-btn.deactivate { color: #f59e0b; }
        .action-icon-btn.activate { color: #10b981; }
        .action-icon-btn.delete { color: #dc2626; }

        .btn-download-all, .btn-add {
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-download-all {
          background: white;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .btn-download-all:hover {
          background: #f8fafc;
          border-color: #0f6cbd;
          color: #0f6cbd;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .btn-add {
          background: #0f6cbd;
          color: white;
          border: 1px solid #0f6cbd;
        }

        .btn-add:hover {
          background: #0d5ca3;
          border-color: #0d5ca3;
          box-shadow: 0 4px 12px rgba(15, 108, 189, 0.2);
          transform: translateY(-1px);
        }

        .btn-add:active {
          transform: translateY(0);
        }

        .table-container {
          background: white;
          border-radius: 20px;
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef2ff;
        }

        .teachers-table {
          width: 100%;
          border-collapse: collapse;
        }

        .teachers-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
        }

        .teachers-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .teachers-table tr:hover {
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

        .teacher-id-cell .teacher-code-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #f1f5f9;
          border-radius: 20px;
          font-size: 0.75rem;
          font-family: monospace;
          color: #475569;
        }

        .teacher-name-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .teacher-avatar {
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

        .teacher-email-cell .email-link {
          color: #0f6cbd;
          text-decoration: none;
          font-size: 0.85rem;
        }

        .teacher-email-cell .email-link:hover {
          text-decoration: underline;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.success {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status-badge.danger {
          background: #ffebee;
          color: #c62828;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .actions-col {
          width: 160px;
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

        .icon-btn.view { color: #0f6cbd; }
        .icon-btn.view:hover { background: #e3f2fd; }
        .icon-btn.edit { color: #f59e0b; }
        .icon-btn.edit:hover { background: #fef3c7; }
        .icon-btn.activate { color: #10b981; }
        .icon-btn.activate:hover { background: #d1fae5; }
        .icon-btn.deactivate { color: #f59e0b; }
        .icon-btn.deactivate:hover { background: #fef3c7; }
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
          .teacher-list-module {
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
          
          .action-buttons button {
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

export default TeacherList;