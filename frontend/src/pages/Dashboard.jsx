import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { Link } from 'react-router-dom';
import { dashboardService } from '../api/dashboardService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { user } = useAuth();
  const username = user?.username;
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const controller = new AbortController();
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats({ signal: controller.signal });
        setStats(data);
      } catch (error) {
        if (error?.name === 'CanceledError') return;
        if (error?.code === 'ERR_CANCELED') return;
        if (error?.response?.status === 401) return;

        console.error('Error fetching dashboard stats:', error);
        toast.error(t('dashboard.toast.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetch();
    return () => controller.abort();
  }, [username, t]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('app.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content fade-in">
      {/* Hero Section */}
      <header className="mb-5">
        <div className="hero d-flex align-items-center">
          <div className="row w-100 g-4 align-items-center">
            <div className="col-auto d-none d-md-block">
              <div className="brand-badge" style={{ width: '80px', height: '80px', borderRadius: '24px' }}>
                <img src="/images/image.png" alt="GIC Logo" style={{ maxWidth: '70%' }} />
              </div>
            </div>
            <div className="col">
              <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                <span className="badge bg-dark bg-opacity-50 text-white px-3 py-2 rounded-pill small fw-bold" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                  {t('dashboard.adminPortal')}
                </span>
                <span className="badge bg-success bg-opacity-25 text-white px-3 py-2 rounded-pill small fw-bold d-flex align-items-center gap-1">
                  <i className="bi bi-shield-check"></i> {t('dashboard.secure')}
                </span>
              </div>
              <h1 className="display-5 fw-bold mb-1 text-white">{t('app.systemName')}</h1>
              <p className="lead mb-0 text-white text-opacity-75">
                {t('dashboard.heroDescription')}
              </p>
            </div>
            <div className="col-12 col-md-3 text-center d-none d-lg-block">
              <div className="hero-visual">
                <i className="bi bi-cpu-fill text-white opacity-25" style={{ fontSize: '6rem' }}></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="section-title mb-0 text-muted fw-bold">{t('dashboard.overviewStatistics')}</h5>
          <span className="badge bg-light text-muted border px-3 py-2 rounded-pill">{t('dashboard.systemStatusActive')}</span>
        </div>

        <div className="row g-4 mb-5">
          {/* Total Students */}
          <div className="col-xl-3 col-md-6">
            <div className="mini-card h-100">
              <p className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                {t('dashboard.totalStudents')}
              </p>
              <div className="d-flex align-items-end justify-content-between">
                <h2 className="display-6 fw-bold mb-0 text-primary">{stats?.total_students || 0}</h2>
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                  <i className="bi bi-people-fill fs-4"></i>
                </div>
              </div>
              <p className="mb-0 text-muted small mt-2">{t('dashboard.activeRegistrations')}</p>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="col-xl-3 col-md-6">
            <div className="mini-card h-100">
              <p className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                {t('dashboard.totalTeachers')}
              </p>
              <div className="d-flex align-items-end justify-content-between">
                <h2 className="display-6 fw-bold mb-0 text-success">{stats?.total_teachers || 0}</h2>
                <div className="bg-success bg-opacity-10 p-2 rounded-3 text-success">
                  <i className="bi bi-person-workspace fs-4"></i>
                </div>
              </div>
              <p className="mb-0 text-muted small mt-2">{t('dashboard.facultiesAndStaff')}</p>
            </div>
          </div>

          {/* Total Courses */}
          <div className="col-xl-3 col-md-6">
            <div className="mini-card h-100">
              <p className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                {t('dashboard.activeCourses')}
              </p>
              <div className="d-flex align-items-end justify-content-between">
                <h2 className="display-6 fw-bold mb-0 text-info">{stats?.total_courses || 0}</h2>
                <div className="bg-info bg-opacity-10 p-2 rounded-3 text-info">
                  <i className="bi bi-book-fill fs-4"></i>
                </div>
              </div>
              <p className="mb-0 text-muted small mt-2">{t('dashboard.curriculums')}</p>
            </div>
          </div>

          {/* System Users */}
          <div className="col-xl-3 col-md-6">
            <div className="mini-card h-100">
              <p className="text-muted text-uppercase fw-bold mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                {t('dashboard.systemUsers')}
              </p>
              <div className="d-flex align-items-end justify-content-between">
                <h2 className="display-6 fw-bold mb-0 text-warning">{stats?.total_users || 0}</h2>
                <div className="bg-warning bg-opacity-10 p-2 rounded-3 text-warning">
                  <i className="bi bi-person-badge-fill fs-4"></i>
                </div>
              </div>
              <p className="mb-0 text-muted small mt-2">{t('dashboard.adminAndGuest')}</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Recent Students */}
          <div className="col-lg-8">
            <div className="glass-panel p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h5 className="mb-0 fw-bold">{t('dashboard.recentStudents')}</h5>
                <Link to="/students" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                  {t('dashboard.viewAll')}
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light bg-opacity-50">
                    <tr>
                      <th className="border-0 text-muted small text-uppercase">{t('dashboard.table.studentId')}</th>
                      <th className="border-0 text-muted small text-uppercase">{t('dashboard.table.name')}</th>
                      <th className="border-0 text-muted small text-uppercase text-center">{t('dashboard.table.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recent_students?.length > 0 ? (
                      stats.recent_students.map(s => (
                        <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href=`/students/${s.id}`}>
                          <td className="fw-bold text-primary">{s.student_id}</td>
                          <td>{s.student_name}</td>
                          <td className="text-center">
                            <span className={`badge rounded-pill ${s.registration_status === 'ACCEPTED' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                              {s.registration_status === 'ACCEPTED' ? t('dashboard.status.enrolled') : s.registration_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted">{t('dashboard.noStudents')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions / Side Column */}
          <div className="col-lg-4">
            <div className="glass-panel p-4 mb-4">
              <h5 className="mb-3 fw-bold border-bottom pb-2">{t('dashboard.quickActions')}</h5>
              <div className="d-flex flex-column gap-2">
                <Link to="/students/new" className="sidebar-link border rounded-3 p-3 bg-white">
                  <i className="bi bi-person-plus text-primary fs-5"></i>
                  <span className="fw-semibold">{t('dashboard.quickAction.newStudent')}</span>
                </Link>
                <Link to="/registrations" className="sidebar-link border rounded-3 p-3 bg-white position-relative">
                  <i className="bi bi-inbox text-primary fs-5"></i>
                  <span className="fw-semibold">{t('dashboard.quickAction.registrations')}</span>
                  {stats?.pending_registrations > 0 && (
                    <span className="badge rounded-pill bg-danger ms-auto">{stats.pending_registrations}</span>
                  )}
                </Link>
                <Link to="/teachers/new" className="sidebar-link border rounded-3 p-3 bg-white">
                  <i className="bi bi-person-workspace text-success fs-5"></i>
                  <span className="fw-semibold">{t('dashboard.quickAction.newTeacher')}</span>
                </Link>
                <Link to="/courses/new" className="sidebar-link border rounded-3 p-3 bg-white">
                  <i className="bi bi-book text-info fs-5"></i>
                  <span className="fw-semibold">{t('dashboard.quickAction.newCourse')}</span>
                </Link>
              </div>
            </div>

            {/* Support Card */}
            <div className="mini-card bg-primary text-white border-0 shadow-lg p-4">
              <p className="text-white text-opacity-75 small text-uppercase fw-bold mb-2">{t('dashboard.support.title')}</p>
              <h5 className="fw-bold mb-3">{t('dashboard.support.help')}</h5>
              <p className="small text-white text-opacity-75 mb-4">{t('dashboard.support.description')}</p>
              <button className="btn btn-white btn-sm w-100 fw-bold border-0 bg-white text-primary">
                {t('dashboard.support.button')}
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .hero {
          background: linear-gradient(135deg, var(--primary) 0%, #6ed6ff 100%);
          color: white;
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          position: relative;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .hero h1 { color: white; font-weight: 700; }
        
        .mini-card {
          padding: 1.25rem;
          border-radius: 1.25rem;
          border: 1px solid rgba(28, 39, 76, 0.08);
          background: white;
          box-shadow: 0 10px 25px rgba(28, 39, 76, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .mini-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 35px rgba(28, 39, 76, 0.1);
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.75);
          border-radius: 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 20px 40px rgba(28, 39, 76, 0.08);
          backdrop-filter: blur(6px);
        }
        
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          border-radius: 1rem;
          color: var(--text-dark);
          text-decoration: none;
          font-weight: 500;
          transition: all 160ms ease;
          border: none;
          background: transparent;
          width: 100%;
          cursor: pointer;
        }
        
        .sidebar-link:hover {
          transform: translateX(4px);
          border-color: var(--primary) !important;
        }
        
        .badge-success-subtle {
          background-color: rgba(25, 135, 84, 0.1);
          color: #198754;
        }
        
        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;