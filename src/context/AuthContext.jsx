import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Demo credentials for development (replace with real backend later)
const DEMO_EMAIL = 'demo@mediastream.com';
const DEMO_PASSWORD = 'demo123';
const MIN_PASSWORD_LENGTH = 6;

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      setUser(saved ? JSON.parse(saved) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (email, password) => {
    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();

    if (!trimmedEmail) return { success: false, error: 'Email is required' };
    if (!isValidEmail(trimmedEmail)) return { success: false, error: 'Please enter a valid email' };
    if (!trimmedPassword) return { success: false, error: 'Password is required' };

    // Demo auth: accept demo credentials; otherwise accept any for local dev
    if (trimmedEmail === DEMO_EMAIL && trimmedPassword !== DEMO_PASSWORD) {
      return { success: false, error: 'Invalid password' };
    }

    const displayName =
      trimmedEmail === DEMO_EMAIL ? 'Demo User' : trimmedEmail.split('@')[0];
    setUser({
      id: trimmedEmail === DEMO_EMAIL ? 1 : Date.now(),
      email: trimmedEmail,
      name: displayName,
    });
    return { success: true };
  };

  const signup = (email, password, name) => {
    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();
    const trimmedName = (name || '').trim();

    if (!trimmedEmail) return { success: false, error: 'Email is required' };
    if (!isValidEmail(trimmedEmail)) return { success: false, error: 'Please enter a valid email' };
    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      return {
        success: false,
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      };
    }

    setUser({
      id: Date.now(),
      email: trimmedEmail,
      name: trimmedName || trimmedEmail.split('@')[0],
    });
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

