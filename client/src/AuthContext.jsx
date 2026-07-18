import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = 'http://localhost:5050/api';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('loop_token'));
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile on mount or token change
  useEffect(() => {
    if (token) {
      localStorage.setItem('loop_token', token);
      fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Session expired');
          }
          return res.json();
        })
        .then(data => {
          if (data.success) {
            setUser(data.user);
            setWorkspace(data.workspace);
          } else {
            logout();
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Session validation failed:', err);
          logout();
          setLoading(false);
        });
    } else {
      localStorage.removeItem('loop_token');
      setUser(null);
      setWorkspace(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      setToken(data.token);
      setUser(data.user);
      setWorkspace(data.workspace);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signup = async (name, email, password, workspaceName, workspaceSlug) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, workspaceName, workspaceSlug })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      setToken(data.token);
      setUser(data.user);
      setWorkspace(data.workspace);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('loop_token');
    setToken(null);
    setUser(null);
    setWorkspace(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, workspace, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
