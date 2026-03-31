import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="login-page container">
      <div className="text-center logo mb-4" style={{ marginTop: '20px' }}>
        <i className="bi bi-mortarboard-fill" style={{ fontSize: '3rem', color: '#34A9FF' }}></i>
      </div>

      <div className="login-card mx-auto" style={{ maxWidth: '600px', padding: '40px 30px', background: '#ffffff', border: '1px solid #E9EEF5', borderRadius: '12px', boxShadow: '0 0 20px rgba(0,0,0,0.02)' }}>
        <h3 className="login-title text-center" style={{ color: '#34A9FF', fontWeight: 600, marginBottom: '25px' }}>{t('auth.login.message')}</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-500">
              {t('auth.email.address')} <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              required
              className="form-control"
              placeholder={t('auth.enter.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ height: '48px', borderColor: '#E0E6F0' }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-500">
              {t('auth.password')} <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                className="form-control pe-5"
                placeholder={t('auth.enter.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ height: '48px', borderColor: '#E0E6F0' }}
              />
              <button
                type="button"
                className="position-absolute top-50 end-0 translate-middle-y pe-3 border-0 bg-transparent text-muted"
                onClick={() => setShowPwd(!showPwd)}
              >
                <i className={`bi ${showPwd ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-2"
            disabled={loading}
            style={{ height: '48px', fontSize: '16px', backgroundColor: '#34A9FF', borderColor: '#34A9FF' }}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>{t('ui.signingIn')}</>
            ) : t('auth.login')}
          </button>
        </form>
      </div>

      <div className="footer-text text-center" style={{ fontSize: '13px', color: '#999', marginTop: '25px' }}>
        © 2025 Global Innovation Consulting Inc. All Rights Reserved.
      </div>
    </div>
  );
};

export default Login;
