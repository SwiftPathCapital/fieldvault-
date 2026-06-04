import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fv_token');
    if (token) {
      api.get('/auth/me')
        .then(u => setUser(u))
        .catch(() => localStorage.removeItem('fv_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { session, user } = await api.post('/auth/login', { email, password });
    localStorage.setItem('fv_token', session.access_token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('fv_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
