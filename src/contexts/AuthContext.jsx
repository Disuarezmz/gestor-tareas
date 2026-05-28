import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

async function authApi(path, options = {}) {
  const res = await fetch('/api/auth' + path, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    authApi('/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await authApi('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const u = await authApi('/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authApi('/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const u = await authApi('/me', { method: 'PUT', body: JSON.stringify(data) });
    setUser(u);
    return u;
  }, []);

  const changePassword = useCallback(async (current, next) => {
    await authApi('/me/password', { method: 'PUT', body: JSON.stringify({ current, next }) });
  }, []);

  const deleteAccount = useCallback(async () => {
    await authApi('/me', { method: 'DELETE' });
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{
      user, authLoading,
      login, register, logout,
      updateProfile, changePassword, deleteAccount,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}
