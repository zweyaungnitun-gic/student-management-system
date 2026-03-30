// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Always set a mock admin user
  const [user, setUser] = useState({
    id: 1,
    username: 'Admin',
    email: 'admin@example.com',
    role: 'ADMIN'
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    // Always return true - bypass login
    console.log('Login bypassed - using mock user');
    return true;
  };

  const logout = () => {
    // Just clear state, no actual logout
    setUser({
      id: 1,
      username: 'Admin',
      email: 'admin@example.com',
      role: 'ADMIN'
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);