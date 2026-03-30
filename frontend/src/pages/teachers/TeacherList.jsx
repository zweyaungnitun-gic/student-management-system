import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Info, PlayCircle, PauseCircle } from 'lucide-react';
import { teacherService } from '../../api/teacherService';
import toast from 'react-hot-toast';

const TeacherList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getAll(search);
      setTeachers(response || []);
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
      if (isActive) {
        await teacherService.deactivate(teacherId);
        toast.success('Teacher deactivated');
      } else {
        await teacherService.activate(teacherId);
        toast.success('Teacher activated');
      }
      fetchTeachers();
    } catch (error) {
      console.error('Error toggling teacher status:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        const response = await teacherService.delete(teacherId);
        toast.success(response?.message || 'Teacher deleted successfully');
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
          <div>
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              Teacher Management
            </h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
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
          <button type="button" onClick={handleClear} className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i className="bi bi-arrow-repeat"></i>
            <span>Refresh</span>
          </button>
        </form>
        <button
          className="btn btn-success d-flex align-items-center gap-2"
          onClick={() => navigate('/teachers/new')}
        >
          <Plus size={16} />
          <span>Add Teacher</span>
        </button>
      </div>

      {/* Teachers Table */}
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
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="text-center" style={{ minWidth: '60px' }}>ID</th>
                    <th className="text-center" style={{ minWidth: '100px' }}>Teacher ID</th>
                    <th style={{ minWidth: '150px' }}>Full Name</th>
                    <th style={{ minWidth: '200px' }}>Email Address</th>
                    <th style={{ minWidth: '120px' }}>Department</th>
                    <th className="text-center" style={{ minWidth: '100px' }}>Status</th>
                    <th className="text-center" style={{ minWidth: '140px' }}>Registered Date</th>
                    <th className="text-center" style={{ minWidth: '180px' }}>Actions</th>
                   </tr>
                </thead>
                <tbody>
                  {teachers.map(teacher => (
                    <tr key={teacher.teacher_id || teacher.teacherId}>
                      <td className="text-center">{teacher.teacher_id || teacher.teacherId}</td>
                      <td className="text-center">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                          {teacher.teacher_code || teacher.teacherCode}
                        </span>
                      </td>
                      <td>{teacher.name}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.department || '-'}</td>
                      <td className="text-center">
                        <span className={`badge rounded-pill px-3 ${teacher.is_active ? 'bg-success' : 'bg-danger'}`}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-center">{formatDate(teacher.created_at || teacher.createdAt)}</td>
                      <td className="text-center">
                        <div className="d-flex gap-3 justify-content-center">
                          <button
                            className="action-icon-link text-info"
                            onClick={() => navigate(`/teachers/${teacher.teacher_id || teacher.teacherId}`)}
                            title="Details"
                          >
                            <Info size={18} />
                          </button>
                          <button
                            className="action-icon-link text-primary"
                            onClick={() => navigate(`/teachers/${teacher.teacher_id || teacher.teacherId}/edit`)}
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          {teacher.is_active ? (
                            <button
                              className="action-icon-link text-warning"
                              onClick={() => handleToggleActive(teacher.teacher_id || teacher.teacherId, true)}
                              title="Deactivate"
                            >
                              <PauseCircle size={18} />
                            </button>
                          ) : (
                            <button
                              className="action-icon-link text-success"
                              onClick={() => handleToggleActive(teacher.teacher_id || teacher.teacherId, false)}
                              title="Activate"
                            >
                              <PlayCircle size={18} />
                            </button>
                          )}
                          <button
                            className="action-icon-link text-danger"
                            onClick={() => handleDelete(teacher.teacher_id || teacher.teacherId)}
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

export default TeacherList;