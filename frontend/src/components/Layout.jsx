import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="dashboard-layout fade-in">
      <Sidebar />
      <main className="dashboard-main">
        <Topbar />
        <div className="page-wrapper py-4 px-3 px-md-5">
          <Outlet />
        </div>
        
        <footer className="dashboard-footer py-4 text-center border-top border-light border-opacity-10 mt-auto">
          <div className="container">
            <p className="mb-0 text-muted small fw-medium">
              © {new Date().getFullYear()} <span className="text-primary-soft text-opacity-75">{t('app.systemName')}</span>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
