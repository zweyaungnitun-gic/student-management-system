import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Topbar = ({ title, subtitle, showAddButton, addButtonLabel, onAddClick }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage || i18n.language;
  
  // Custom title mapping based on route if not provided
  const getPageInfo = () => {
    const defaultInfo = { title: t('topbar.default.title'), subtitle: t('topbar.default.subtitle') };
    const path = location.pathname;
    
    if (path.includes('/registrations')) return { title: t('topbar.registrations.title'), subtitle: t('topbar.registrations.subtitle') };
    if (path.includes('/students')) return { title: t('topbar.students.title'), subtitle: t('topbar.students.subtitle') };
    if (path.includes('/teachers')) return { title: t('topbar.teachers.title'), subtitle: t('topbar.teachers.subtitle') };
    if (path.includes('/courses')) return { title: t('topbar.courses.title'), subtitle: t('topbar.courses.subtitle') };
    if (path.includes('/tests')) return { title: t('topbar.tests.title'), subtitle: t('topbar.tests.subtitle') };
    if (path.includes('/results')) return { title: t('topbar.results.title'), subtitle: t('topbar.results.subtitle') };
    if (path.includes('/reports')) return { title: t('topbar.reports.title'), subtitle: t('topbar.reports.subtitle') };
    if (path.includes('/enrollments')) return { title: t('topbar.enrollments.title'), subtitle: t('topbar.enrollments.subtitle') };
    if (path.includes('/users')) return { title: t('topbar.users.title'), subtitle: t('topbar.users.subtitle') };
    if (path.includes('/super-admin')) return { title: t('superAdmin.dashboard.title'), subtitle: t('superAdmin.dashboard.subtitle') };
    
    return defaultInfo;
  };

  const info = getPageInfo();
  const currentTitle = title || info.title;
  const currentSubtitle = subtitle || info.subtitle;

  return (
    <header className="dashboard-topbar d-flex justify-content-between align-items-center">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light btn-icon d-lg-none" type="button" aria-label="Toggle sidebar">
          <i className="bi bi-list fs-4"></i>
        </button>
        {/* <div>
          <p className="text-uppercase text-muted small fw-semibold mb-1">
            {currentSubtitle}
          </p>
          <h4 className="mb-0 fw-bold">{currentTitle}</h4>
        </div> */}
      </div>

      <div className="topbar-actions d-flex align-items-center gap-2">
        {/* <div className="topbar-search d-none d-md-flex align-items-center">
          <i className="bi bi-search text-muted"></i>
          <input type="search" className="form-control border-0 bg-transparent shadow-none p-0 ps-2"
            placeholder={`${t('app.search')}...`} />
        </div> */}

        {/* Language Selector Dropdown */}
        {/* <div className="dropdown">
          <button className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2 px-3" type="button"
            id="topbarLanguageDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ borderRadius: '999px' }}>
            <i className="bi bi-globe"></i>
            <span>{t('app.language')}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="topbarLanguageDropdown" style={{ borderRadius: '12px' }}>
            <li>
              <button
                className={`dropdown-item d-flex align-items-center gap-2${currentLang === 'en' ? ' active' : ''}`}
                type="button"
                onClick={() => {
                  i18n.changeLanguage('en');
                  localStorage.setItem('lang', 'en');
                }}
              >
                <span>{t('nav.language.english')}</span>
              </button>
            </li>
            <li>
              <button
                className={`dropdown-item d-flex align-items-center gap-2${currentLang === 'ja' ? ' active' : ''}`}
                type="button"
                onClick={() => {
                  i18n.changeLanguage('ja');
                  localStorage.setItem('lang', 'ja');
                }}
              >
                <span>{t('nav.language.japanese')}</span>
              </button>
            </li>
          </ul>
        </div> */}

        {showAddButton && (
          <button className="btn btn-primary d-flex align-items-center gap-2 px-3" onClick={onAddClick} style={{ borderRadius: '999px' }}>
            <i className="bi bi-plus-lg"></i>
            <span className="fw-semibold">{addButtonLabel || t('common.addNew')}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
