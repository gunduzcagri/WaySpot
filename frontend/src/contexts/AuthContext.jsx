import { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('wayspot_user');
      if (raw && raw !== 'null') {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      username: 'testuser',
      email: 'test@wayspot.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user'
    };
  });

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token } = res.data;
    const user = { username: res.data.username, email: res.data.email, firstName: res.data.firstName, lastName: res.data.lastName, role: res.data.role };
    localStorage.setItem('wayspot_token', token);
    localStorage.setItem('wayspot_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token } = res.data;
    const user = { username: res.data.username, email: res.data.email, firstName: res.data.firstName, lastName: res.data.lastName, role: res.data.role };
    localStorage.setItem('wayspot_token', token);
    localStorage.setItem('wayspot_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('wayspot_token');
    localStorage.removeItem('wayspot_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
