import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentService } from '../../api/studentService';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Download, Trash2, Eye, Edit, UserPlus, Users } from 'lucide-react';

const StudentList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
      setCurrentPage(1);
    } catch (err) {
      toast.error(t('students.list.toast.fetchFailed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(t('students.list.confirmDelete', { name }))) {
      try {
        await studentService.delete(id);
        toast.success(t('students.list.toast.deleted', { name }));
        fetchStudents();
        setSelectedIds([]);
        setSelectAll(false);
      } catch {
        toast.error(t('students.list.toast.deleteFailed'));
      }
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (e, id) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      const newSelected = selectedIds.filter(i => i !== id);
      setSelectedIds(newSelected);
      setSelectAll(newSelected.length === filteredStudents.length && filteredStudents.length > 0);
    } else {
      const newSelected = [...selectedIds, id];
      setSelectedIds(newSelected);
      setSelectAll(newSelected.length === filteredStudents.length);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No students selected');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected student(s)?`)) {
      try {
        let successCount = 0;
        let failCount = 0;
        
        for (const id of selectedIds) {
          try {
            await studentService.delete(id);
            successCount++;
          } catch {
            failCount++;
          }
        }
        
        if (successCount > 0) {
          toast.success(`${successCount} student(s) deleted successfully`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} student(s) failed to delete`);
        }
        
        fetchStudents();
        setSelectedIds([]);
        setSelectAll(false);
      } catch (error) {
        toast.error('Bulk delete failed');
      }
    }
  };

  const handleDownloadCSV = () => {
    try {
      // Prepare data for CSV
      const headers = [
        'Student ID',
        'Name',
        'Gender',
        'Phone Number',
        'National ID',
        'Date of Birth',
        'Current Address',
        'Hometown Address',
        'Religion',
        'Registration Status',
        'Enrolled Date'
      ];

      const selectedStudents = students.filter(s => selectedIds.includes(s.id));
      const studentsToExport = selectedIds.length > 0 ? selectedStudents : students;
      
      if (studentsToExport.length === 0) {
        toast.error('No students to export');
        return;
      }

      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const student of studentsToExport) {
        const row = [
          `"${student.student_id || ''}"`,
          `"${student.student_name || ''}"`,
          `"${student.gender || ''}"`,
          `"${student.phone_number || ''}"`,
          `"${student.national_id || ''}"`,
          `"${student.date_of_birth || ''}"`,
          `"${(student.current_living_address || '').replace(/"/g, '""')}"`,
          `"${(student.home_town_address || '').replace(/"/g, '""')}"`,
          `"${student.religion || ''}"`,
          `"${student.registration_status || ''}"`,
          `"${student.enrolled_date || ''}"`
        ];
        csvRows.push(row.join(','));
      }

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${studentsToExport.length} student(s)`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export students');
    }
  };

  const filteredStudents = students.filter(s => 
    s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.national_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ENROLLED':
        return <span className="status-badge success"><span className="status-dot"></span>Enrolled</span>;
      case 'ACCEPTED':
        return <span className="status-badge success"><span className="status-dot"></span>Accepted</span>;
      case 'PENDING':
        return <span className="status-badge warning"><span className="status-dot"></span>Pending</span>;
      case 'COMPLETED':
        return <span className="status-badge info"><span className="status-dot"></span>Completed</span>;
      case 'REJECTED':
        return <span className="status-badge danger"><span className="status-dot"></span>Rejected</span>;
      default:
        return <span className="status-badge secondary">{status}</span>;
    }
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

  if (loading && students.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-list-module">
      {/* Header */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-icon">
            <Users size={32} />
          </div>
          <div className="header-text">
            <h1 className="header-title">{t('students.list.title')}</h1>
            <p className="header-subtitle">Manage student records, track enrollment, and monitor academic progress</p>
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
            <h3>{students.length}</h3>
            <p>Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <span className="status-dot active"></span>
          </div>
          <div className="stat-info">
            <h3>{students.filter(s => s.registration_status === 'ENROLLED' || s.registration_status === 'ACCEPTED').length}</h3>
            <p>Active Students</p>
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="stat-card selected">
            <div className="stat-icon purple">
              <span>{selectedIds.length}</span>
            </div>
            <div className="stat-info">
              <h3>Selected</h3>
              <p>{selectedIds.length} student(s)</p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Action Bar */}
      <div className="action-bar">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, ID, or National ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="action-buttons">
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
          <button className="btn-add" onClick={() => navigate('/students/new')}>
            <UserPlus size={16} />
            <span>{t('students.list.actions.addStudent')}</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      {paginatedStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No students found</h3>
          <p>Try adjusting your search or add a new student.</p>
          <button className="btn-add-primary" onClick={() => navigate('/students/new')}>
            <UserPlus size={18} />
            <span>Add Your First Student</span>
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>National ID</th>
                  <th>Status</th>
                  <th>Enrolled Date</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map(student => (
                  <tr key={student.id}>
                    <td className="checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(student.id)}
                        onChange={(e) => handleSelectRow(e, student.id)}
                      />
                    </td>
                    <td className="student-id-cell">{student.student_id}</td>
                    <td className="student-name-cell">
                      <div className="student-name-info">
                        <div className="student-avatar">
                          {(student.student_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span>{student.student_name}</span>
                      </div>
                    </td>
                    <td>{student.gender || '-'}</td>
                    <td>{student.phone_number || '-'}</td>
                    <td className="national-id-cell">{student.national_id || '-'}</td>
                    <td>{getStatusBadge(student.registration_status)}</td>
                    <td>{formatDate(student.enrolled_date)}</td>
                    <td className="actions-col">
                      <div className="action-icons">
                        <button
                          className="icon-btn view"
                          onClick={() => navigate(`/students/${student.id}`)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn edit"
                          onClick={() => navigate(`/students/${student.id}/edit`)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={(e) => handleDelete(e, student.id, student.student_name)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </span>
            <span className="selected-info">
              {selectedIds.length} student(s) selected
            </span>
          </div>
        </>
      )}

      <style>{`
        .student-list-module {
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

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }

        .status-dot.active {
          background: #2e7d32;
          box-shadow: 0 0 0 2px #e8f5e9;
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
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
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

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .btn-add, .btn-download, .btn-download-all, .btn-bulk-delete {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
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

        .students-table {
          width: 100%;
          border-collapse: collapse;
        }

        .students-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          font-weight: 600;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85rem;
        }

        .students-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
        }

        .students-table tr:hover {
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

        .student-id-cell {
          font-family: monospace;
          font-weight: 600;
          color: #0f6cbd;
        }

        .student-name-cell {
          font-weight: 500;
          color: #1e293b;
        }

        .student-name-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .student-avatar {
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

        .national-id-cell {
          font-family: monospace;
          font-size: 0.8rem;
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

        .status-badge.success { background: #e8f5e9; color: #2e7d32; }
        .status-badge.warning { background: #fff3e0; color: #ed6c02; }
        .status-badge.info { background: #e3f2fd; color: #1976d2; }
        .status-badge.danger { background: #ffebee; color: #c62828; }
        .status-badge.secondary { background: #e2e8f0; color: #475569; }

        .actions-col {
          width: 100px;
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
        .icon-btn.delete { color: #dc2626; }
        .icon-btn.delete:hover { background: #fee2e2; }

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
          .student-list-module {
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

export default StudentList;