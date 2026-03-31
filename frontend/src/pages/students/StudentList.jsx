import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentService } from '../../api/studentService';
import { useTranslation } from 'react-i18next';

const StudentList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
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
      } catch {
        toast.error(t('students.list.toast.deleteFailed'));
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
              {t('students.list.title')}
            </h1>
          </div>
          <div className="ms-auto d-flex gap-2">
            <button className="btn btn-primary btn-sm px-3" onClick={() => navigate('/students/new')}>
              <i className="bi bi-person-plus-fill me-2"></i>{t('students.list.actions.addStudent')}
            </button>
            <button className="btn btn-outline-primary btn-sm px-3" onClick={() => navigate('/teachers')}>
              <i className="bi bi-people-fill me-2"></i>{t('students.list.actions.teacherManagement')}
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
                      <span className="small fw-bold">{t('students.list.filters.selectAll')}</span>
                    </div>
                    
                    <div className="filter-control-group">
                      <span className="small fw-bold">{t('students.list.filters.searchByName')}</span>
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        placeholder={t('students.list.filters.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '180px' }}
                      />
                    </div>

                    <div className="ms-auto">
                      <button className="btn btn-primary btn-sm px-3" style={{ background: '#0b5ed7' }}>
                        <i className="bi bi-download me-2"></i>{t('common.download')}
                      </button>
                    </div>
                  </div>
                </th>
              </tr>
              <tr>
                <th style={{ width: '80px' }}>{t('students.list.table.studentId')}</th>
                <th>{t('students.list.table.name')}</th>
                <th style={{ width: '80px' }}>{t('students.list.table.gender')}</th>
                <th>{t('students.list.table.phone')}</th>
                <th>{t('students.list.table.desiredJob')}</th>
                <th style={{ width: '100px' }}>{t('students.list.table.status')}</th>
                <th>{t('students.list.table.scheduledPaymentDate')}</th>
                <th>{t('students.list.table.actualPaymentDate')}</th>
                <th style={{ width: '130px' }}>{t('students.list.table.actions')}</th>
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
                  <td colSpan="9" className="text-center py-5 text-muted">{t('students.list.empty')}</td>
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
                    <td>{s.gender || t('common.placeholderDash')}</td>
                    <td>{s.phone_number || t('common.placeholderDash')}</td>
                    <td>{s.desired_job_type || t('common.placeholderDash')}</td>
                    <td>
                      <span className={`badge rounded-pill ${s.registration_status === 'ACCEPTED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {s.registration_status === 'ACCEPTED' ? t('students.status.acceptedLabel') : s.registration_status}
                      </span>
                    </td>
                    <td>{s.schedule_payment_date ? new Date(s.schedule_payment_date).toLocaleDateString() : t('common.placeholderDash')}</td>
                    <td>{s.actual_payment_date ? new Date(s.actual_payment_date).toLocaleDateString() : t('common.placeholderDash')}</td>
                    <td className="action-cell">
                      <div className="d-flex justify-content-center gap-3">
                        <button className="border-0 bg-transparent text-info p-0" title={t('common.details')} onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}`); }}>
                          <i className="bi bi-info-circle"></i>
                        </button>
                        <button className="border-0 bg-transparent text-primary p-0" title={t('common.edit')} onClick={(e) => { e.stopPropagation(); navigate(`/students/${s.id}/edit`); }}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="border-0 bg-transparent text-success p-0" title={t('students.list.actions.results')} onClick={(e) => { e.stopPropagation(); navigate(`/results?studentId=${s.id}`); }}>
                          <i className="bi bi-bar-chart-fill"></i>
                        </button>
                        <button className="border-0 bg-transparent text-danger p-0" title={t('common.delete')} onClick={(e) => handleDelete(e, s.id, s.student_name)}>
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
