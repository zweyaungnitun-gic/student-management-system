import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { enrollmentService } from '../../api/enrollmentService';
import toast from 'react-hot-toast';

const EnrollmentList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentService.getAll();
      setEnrollments(data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error(t('enrollment.list.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm(t('enrollment.list.deleteConfirm'))) {
      try {
        await enrollmentService.delete(id);
        toast.success(t('enrollment.list.deleteSuccess'));
        fetchEnrollments();
      } catch {
        toast.error(t('enrollment.list.deleteError'));
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'enrolled': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'completed': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <h1 className="mb-0" style={{ color: '#0a58a0', fontWeight: 600, fontSize: '1.8rem' }}>
              {t('enrollment.list.title')}
            </h1>
          </div>
          <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" 
            onClick={() => navigate('/enrollments/new')}
            style={{ backgroundColor: '#0b5ed7', border: 'none' }}>
            <i className="bi bi-plus-lg"></i>
            <span>{t('enrollment.list.newEnrollment')}</span>
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3">{t('enrollment.list.student')}</th>
                  <th className="py-3">{t('enrollment.list.course')}</th>
                  <th className="py-3">{t('enrollment.list.semester')}</th>
                  <th className="py-3">{t('enrollment.list.status')}</th>
                  <th className="py-3">{t('enrollment.list.enrollmentDate')}</th>
                  <th className="text-center pe-4 py-3">{t('enrollment.list.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </td>
                  </tr>
                ) : enrollments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">{t('enrollment.list.noData')}</td>
                  </tr>
                ) : (
                  enrollments.map(e => (
                    <tr key={e.id}>
                      <td className="ps-4">
                        <div className="fw-bold">{e.student_name}</div>
                        <small className="text-muted">{e.student_id_number}</small>
                      </td>
                      <td>
                        <div className="fw-medium">{e.course_name}</div>
                        <small className="text-muted">{e.course_code}</small>
                      </td>
                      <td>{e.semester}</td>
                      <td>
                        <span className={`badge px-3 py-2 rounded-pill fw-medium ${getStatusBadgeClass(e.status)}`}>
                          {t(`enrollment.status.${e.status.toLowerCase()}`) || e.status}
                        </span>
                      </td>
                      <td>{e.enrolled_date ? new Date(e.enrolled_date).toLocaleDateString() : '-'}</td>
                      <td className="text-center pe-4">
                        <div className="d-flex justify-content-center gap-3">
                          <button className="border-0 bg-transparent text-primary p-0" title={t('common.edit')}
                            onClick={() => navigate(`/enrollments/${e.id}/edit`)}>
                            <i className="bi bi-pencil" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                          <button className="border-0 bg-transparent text-danger p-0" title={t('common.delete')}
                            onClick={(event) => handleDelete(event, e.id)}>
                            <i className="bi bi-trash" style={{ fontSize: '1.2rem' }}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentList;
