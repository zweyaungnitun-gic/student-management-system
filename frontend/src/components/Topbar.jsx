import React from 'react';
import { useLocation } from 'react-router-dom';

const Topbar = ({ title, subtitle, showAddButton, addButtonLabel, onAddClick }) => {
  const location = useLocation();
  
  // Custom title mapping based on route if not provided
  const getPageInfo = () => {
    const defaultInfo = { title: 'Admin Dashboard', subtitle: 'Welcome back' };
    const path = location.pathname;
    
    if (path.includes('/registrations')) return { title: 'Registrations', subtitle: 'Review and process incoming student registration applications.' };
    if (path.includes('/students')) return { title: 'Student Management', subtitle: 'Manage academic and personal student records.' };
    if (path.includes('/teachers')) return { title: 'Teacher Management', subtitle: 'Manage faculty and staff records.' };
    if (path.includes('/courses')) return { title: 'Course Management', subtitle: 'Manage academic courses and curriculum.' };
    if (path.includes('/tests')) return { title: 'Test Management', subtitle: 'Manage academic tests and examinations.' };
    if (path.includes('/results')) return { title: 'Test Results', subtitle: 'View and manage student test performance.' };
    if (path.includes('/users')) return { title: 'User Management', subtitle: 'Manage admin and guest system accounts.' };
    
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
        <div>
          <p className="text-uppercase text-muted small fw-semibold mb-1">
            {currentSubtitle}
          </p>
          <h4 className="mb-0 fw-bold">{currentTitle}</h4>
        </div>
      </div>

      <div className="topbar-actions d-flex align-items-center gap-2">
        <div className="topbar-search d-none d-md-flex align-items-center">
          <i className="bi bi-search text-muted"></i>
          <input type="search" className="form-control border-0 bg-transparent shadow-none p-0 ps-2"
            placeholder="Search dashboard..." />
        </div>

        {/* Language Selector Dropdown */}
        <div className="dropdown">
          <button className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2 px-3" type="button"
            id="topbarLanguageDropdown" data-bs-toggle="dropdown" aria-expanded="false" style={{ borderRadius: '999px' }}>
            <i className="bi bi-globe"></i>
            <span>Language</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" aria-labelledby="topbarLanguageDropdown" style={{ borderRadius: '12px' }}>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2 active">
                <span>🇺🇸</span> English
              </button>
            </li>
            <li>
              <button className="dropdown-item d-flex align-items-center gap-2">
                <span>🇯🇵</span> 日本語
              </button>
            </li>
          </ul>
        </div>

        {showAddButton && (
          <button className="btn btn-primary d-flex align-items-center gap-2 px-3" onClick={onAddClick} style={{ borderRadius: '999px' }}>
            <i className="bi bi-plus-lg"></i>
            <span className="fw-semibold">{addButtonLabel || 'Add New'}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
