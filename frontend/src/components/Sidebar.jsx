import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from 'react-i18next';

const LinkItem = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
    end
  >
    <i className={`bi ${icon}`}></i>
    <span>{label}</span>
    {badge && <span className="sidebar-pill">{badge}</span>}
  </NavLink>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [managementOpen, setManagementOpen] = useState(true);
  const [academicOpen, setAcademicOpen] = useState(false);
  const currentLang = i18n.resolvedLanguage || i18n.language;
  const role = user?.role;
  const isSuperAdmin = role === 'SUPER_ADMIN';

  return (
    <aside className="dashboard-sidebar glass-panel sidebar-scrollable">
      {/* Brand */}
      <div className="sidebar-brand gap-3">
        <div className="brand-badge bg-white shadow-sm">
          <img src="/images/image.png" alt="GIC logo" />
        </div>
        <div className="flex-grow-1">
          <p className="text-uppercase text-muted small fw-semibold mb-0" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>
            {t('app.systemName')}
          </p>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="d-flex align-items-center gap-3">
          <img className="user-avatar" src="/images/profile.jpg" alt="Admin avatar" />
          <div>
            <p className="mb-0 fw-semibold small text-truncate" style={{ maxWidth: '150px' }}>
              {user?.username || 'Admin'}
            </p>
            <p className="mb-0 small text-muted">
              {role === 'SUPER_ADMIN'
                ? 'Super Admin'
                : role === 'ADMIN'
                  ? 'Admin'
                  : role === 'TEACHER'
                    ? 'Teacher'
                    : 'User'}
            </p>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="language-selector-sidebar mt-2">
        <div className="d-flex gap-1 justify-content-center">
          <div
            className={`lang-pill${currentLang === 'en' ? ' active' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              i18n.changeLanguage('en');
              localStorage.setItem('lang', 'en');
            }}
          >
            <i className="bi bi-globe2 me-1"></i> {t('nav.language.english')}
          </div>
          <span className="lang-divider text-secondary px-1">|</span>
          <div
            className={`lang-pill${currentLang === 'ja' ? ' active' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              i18n.changeLanguage('ja');
              localStorage.setItem('lang', 'ja');
            }}
          >
            <i className="bi bi-globe2 me-1"></i> {t('nav.language.japanese')}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav mt-3">
        <p className="sidebar-label">{t('nav.home')}</p>
        <LinkItem to="/dashboard" icon="bi-speedometer2" label={t('nav.dashboard')} />
        <LinkItem to="/registrations" icon="bi-inbox" label={t('nav.registrations')} badge="New" />

        <p className="sidebar-label mt-3">{t('nav.master.management')}</p>

        {/* Master Management Group */}
        <div className="nav-item">
          <button
            className="sidebar-link w-100 d-flex align-items-center"
            onClick={() => setManagementOpen(!managementOpen)}
          >
            <i className="bi bi-hdd-stack"></i>
            <span>{t('nav.master.management')}</span>
            <i className="bi bi-chevron-down ms-auto small transition-icon"
               style={{ transform: managementOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}></i>
          </button>
          {managementOpen && (
            <div className="ms-3 ps-2 border-start border-light border-opacity-10 mt-1 d-flex flex-column gap-1">
              <LinkItem to="/students" icon="bi-people" label={t('nav.student.management')} />
              <LinkItem to="/teachers" icon="bi-person-workspace" label={t('nav.teacher.management')} />
              <LinkItem to="/courses" icon="bi-book" label={t('nav.course.management')} />
            </div>
          )}
        </div>

        {/* Academic Group */}
        <div className="nav-item mt-1">
          <button
            className="sidebar-link w-100 d-flex align-items-center"
            onClick={() => setAcademicOpen(!academicOpen)}
          >
            <i className="bi bi-mortarboard"></i>
            <span>{t('nav.academic.management')}</span>
            <i className="bi bi-chevron-down ms-auto small transition-icon"
               style={{ transform: academicOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}></i>
          </button>
          {academicOpen && (
            <div className="ms-3 ps-2 border-start border-light border-opacity-10 mt-1 d-flex flex-column gap-1">
              <LinkItem to="/enrollments" icon="bi-person-check" label={t('nav.enrollment.management')} />
              <LinkItem to="/tests" icon="bi-file-text" label={t('nav.test.management')} />
              <LinkItem to="/results" icon="bi-bar-chart" label={t('nav.test.results')} />
              <LinkItem to="/reports" icon="bi-trophy" label={t('nav.report.dashboard')} />
            </div>
          )}
        </div>

        <p className="sidebar-label mt-3">{t('sidebar.system')}</p>
        {isSuperAdmin && (
          <>
            <LinkItem to="/super-admin" icon="bi-shield-lock" label={t('nav.superAdmin.dashboard')} />
            <LinkItem to="/users" icon="bi-person-badge" label={t('nav.user.management')} />
          </>
        )}

        <button
          className="sidebar-link text-danger fw-semibold mt-auto"
          onClick={() => { logout(); navigate('/login'); }}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>{t('nav.logout')}</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
