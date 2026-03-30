// frontend/src/pages/teachers/TeacherList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import { Plus, Pencil, Trash2, Info, PlayCircle, PauseCircle, Eye } from 'lucide-react';
import client from '../../api/client';
import toast from 'react-hot-toast';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Fetch teachers from API
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search && search.trim()) {
        params.search = search.trim();
      }
      const response = await client.get('/teachers', { params });
      console.log('Teachers response:', response.data);
      
      // Sort teachers by teacher_id and active status (active first)
      const sortedData = (response.data || []).sort((a, b) => {
        // Active first
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        
        // Then by teacher_id
        const idA = a.teacher_id || a.teacherId || 0;
        const idB = b.teacher_id || b.teacherId || 0;
        return idA - idB;
      });
      
      setTeachers(sortedData);
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
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
  };

  const handleToggleActive = async (teacherId, isActive) => {
    try {
      const endpoint = isActive 
        ? `/teachers/deactivate/${teacherId}`
        : `/teachers/activate/${teacherId}`;
      await client.post(endpoint);
      toast.success(isActive ? 'Teacher deactivated' : 'Teacher activated');
      fetchTeachers();
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await client.delete(`/teachers/delete/${teacherId}`);
        toast.success(response.data?.message || 'Teacher deleted successfully');
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
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

  const columns = [
    { 
      header: 'ID', 
      accessor: 'teacher_id',
      className: 'text-center',
      render: (row) => <span>{row.teacher_id || row.teacherId || '-'}</span>
    },
    { 
      header: 'Teacher ID', 
      accessor: 'teacher_code',
      className: 'text-center',
      render: (row) => (
        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
          {row.teacher_code || row.teacherCode || '-'}
        </span>
      )
    },
    { 
      header: 'Full Name', 
      accessor: 'name',
      render: (row) => row.name || '-'
    },
    { 
      header: 'Email Address', 
      accessor: 'email',
      render: (row) => row.email || '-'
    },
    { 
      header: 'Department', 
      accessor: 'department',
      render: (row) => row.department || '-'
    },
    {
      header: 'Status',
      accessor: 'is_active',
      className: 'text-center',
      render: (row) => (
        <span className={`badge rounded-pill px-3 ${row.is_active ? 'bg-success' : 'bg-danger'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Registered Date',
      accessor: 'created_at',
      className: 'text-center',
      render: (row) => formatDate(row.created_at || row.createdAt)
    },
    {
      header: 'Actions',
      accessor: 'teacher_id',
      className: 'text-center',
      render: (row) => {
        const teacherId = row.teacher_id || row.teacherId;
        return (
          <div className="d-flex gap-3 justify-content-center">
            <button
              className="action-icon-link text-info"
              onClick={(e) => { e.stopPropagation(); navigate(`/teachers/${teacherId}`); }}
              title="Details"
            >
              <Eye size={18} />
            </button>
            <button
              className="action-icon-link text-primary"
              onClick={(e) => { e.stopPropagation(); navigate(`/teachers/${teacherId}/edit`); }}
              title="Edit"
            >
              <Pencil size={18} />
            </button>
            {row.is_active ? (
              <button
                className="action-icon-link text-warning"
                onClick={(e) => { e.stopPropagation(); handleToggleActive(teacherId, true); }}
                title="Deactivate"
              >
                <PauseCircle size={18} />
              </button>
            ) : (
              <button
                className="action-icon-link text-success"
                onClick={(e) => { e.stopPropagation(); handleToggleActive(teacherId, false); }}
                title="Activate"
              >
                <PlayCircle size={18} />
              </button>
            )}
            <button
              className="action-icon-link text-danger"
              onClick={(e) => { e.stopPropagation(); handleDelete(teacherId); }}
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      }
    },
  ];

  const actionButton = (
    <button
      className="btn btn-success d-flex align-items-center gap-2"
      onClick={() => navigate('/teachers/new')}
    >
      <Plus size={16} />
      <span>Add Teacher</span>
    </button>
  );

  const SearchBar = () => (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <form onSubmit={handleSearch} className="d-flex gap-2 flex-grow-1 me-3">
            <div className="input-group" style={{ maxWidth: '400px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by teacher name, email, or ID..."
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
          {actionButton}
        </div>
      </div>
    </div>
  );

  if (loading && teachers.length === 0) {
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
          <button className="btn btn-light btn-icon d-lg-none" type="button" data-sidebar-toggle>
            <i className="bi bi-list fs-4"></i>
          </button>
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Teacher Management
            </h1>
          </div>
        </div>
      </div>

      <SearchBar />

      {teachers.length === 0 && !loading ? (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-5">
            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
            <span>No teachers registered.</span>
            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/teachers/new')}
              >
                <Plus size={16} className="me-2" />
                Add Your First Teacher
              </button>
            </div>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={teachers}
          title="Teachers"
          searchPlaceholder="Search by teacher name, email, or ID..."
        />
      )}
    </div>
  );
};

export default TeacherList;