import React, { useState, useEffect } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContextBase';
import { useTranslation } from 'react-i18next';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Typically we'd call /me here, but for now just mock based on token
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({ username: 'Admin User' });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await client.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      setUser({ username });
      toast.success(t('auth.login.success'));
      return true;
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error(t('auth.login.error'));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success(t('auth.logout.success'));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
