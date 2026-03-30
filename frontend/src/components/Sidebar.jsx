import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [managementOpen, setManagementOpen] = useState(true);
  const [academicOpen, setAcademicOpen] = useState(false);

  const Link = ({ to, icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
      end
    >
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="dashboard-sidebar glass-panel sidebar-scrollable">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-badge">
          <i className="bi bi-mortarboard-fill"></i>
        </div>
        <div className="flex-grow-1">
          <p className="text-uppercase text-muted small fw-semibold mb-0" style={{ fontSize: '0.65rem' }}>
            Student Management
          </p>
          <p className="fw-bold mb-0 small">GIC System</p>
        </div>
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="d-flex align-items-center gap-3">
          <div className="user-avatar-placeholder">
            {(user?.username || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="mb-0 fw-semibold small">{user?.username || 'Admin'}</p>
            <p className="mb-0 small text-muted">Administrator</p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="language-selector-sidebar">
        <div className="d-flex gap-1 justify-content-center">
          <a href="#" className="lang-pill active"><i className="bi bi-globe2 me-1"></i>EN</a>
          <span className="lang-divider text-secondary align-self-center mx-1">|</span>
          <a href="#" className="lang-pill"><i className="bi bi-globe2 me-1"></i>JP</a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav mt-2">
        <Link to="/dashboard" icon="bi-speedometer2" label="Dashboard" />
        <Link to="/registrations" icon="bi-inbox" label="Registrations" />

        <div className="sidebar-label mt-2">Management</div>

        {/* Master Management collapse */}
        <div>
          <button
            className="sidebar-link w-100 border-0 bg-transparent d-flex align-items-center"
            onClick={() => setManagementOpen(!managementOpen)}
          >
            <i className="bi bi-hdd-stack"></i>
            <span className="me-auto">Master Management</span>
            <i className={`bi bi-chevron-down ms-auto small transition-icon${managementOpen ? '' : ' collapsed'}`}
              style={{ transform: managementOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}></i>
          </button>
          {managementOpen && (
            <nav className="sidebar-nav ps-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '1.25rem' }}>
              <Link to="/students" icon="bi-people" label="Students" />
              <Link to="/teachers" icon="bi-person-workspace" label="Teachers" />
              <Link to="/courses" icon="bi-book" label="Courses" />
            </nav>
          )}
        </div>

        {/* Academic */}
        <div>
          <button
            className="sidebar-link w-100 border-0 bg-transparent d-flex align-items-center"
            onClick={() => setAcademicOpen(!academicOpen)}
          >
            <i className="bi bi-journal-bookmark-fill"></i>
            <span className="me-auto">Academic</span>
            <i className="bi bi-chevron-down ms-auto small"
              style={{ transform: academicOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}></i>
          </button>
          {academicOpen && (
            <nav className="sidebar-nav ps-3" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '1.25rem' }}>
              <Link to="/enrollments" icon="bi-person-plus" label="Enrollments" />
              <Link to="/tests" icon="bi-file-earmark-text" label="Tests" />
              <Link to="/results" icon="bi-bar-chart-fill" label="Test Results" />
              <Link to="/reports" icon="bi-graph-up" label="Report Cards" />
            </nav>
          )}
        </div>

        <div className="sidebar-label mt-2">System</div>
        <Link to="/users" icon="bi-people-fill" label="User Management" />

        <div className="mt-3 px-2">
          <button
            className="btn btn-outline-danger btn-sm w-100"
            onClick={() => { logout(); navigate('/login'); }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>Sign Out
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
