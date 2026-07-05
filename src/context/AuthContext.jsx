import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Local demo auth for development (replace with real backend before production)
const DEMO_EMAIL = 'demo@mediastream.com';
const DEMO_PASSWORD = 'demo123';
const MIN_PASSWORD_LENGTH = 6;
const USER_SESSION_KEY = 'mediastream:user';
const USER_ACCOUNTS_KEY = 'mediastream:users';

const demoUser = {
  id: 'demo-user',
  email: DEMO_EMAIL,
  name: 'Demo User',
  password: DEMO_PASSWORD,
};

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
      const saved = localStorage.getItem(USER_SESSION_KEY) || localStorage.getItem('user');
      setUser(saved ? JSON.parse(saved) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
      localStorage.removeItem('user');
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem('user');
    }
  }, [user]);

  const getAccounts = () => {
    try {
      const savedAccounts = JSON.parse(localStorage.getItem(USER_ACCOUNTS_KEY) || '[]');
      const hasDemoUser = savedAccounts.some((account) => account.email === DEMO_EMAIL);
      return hasDemoUser ? savedAccounts : [demoUser, ...savedAccounts];
    } catch {
      return [demoUser];
    }
  };

  const saveAccounts = (accounts) => {
    localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  const setSession = (account) => {
    const { password, ...sessionUser } = account;
    setUser(sessionUser);
  };

  const login = (email, password) => {
    const trimmedEmail = (email || '').trim();
    const trimmedPassword = (password || '').trim();

    if (!trimmedEmail) return { success: false, error: 'Email is required' };
    if (!isValidEmail(trimmedEmail)) return { success: false, error: 'Please enter a valid email' };
    if (!trimmedPassword) return { success: false, error: 'Password is required' };

    const account = getAccounts().find(
      (item) => item.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (!account || account.password !== trimmedPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    setSession(account);
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

    const accounts = getAccounts();
    const accountExists = accounts.some(
      (account) => account.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    if (accountExists) {
      return { success: false, error: 'An account already exists for this email' };
    }

    const account = {
      id: String(Date.now()),
      email: trimmedEmail,
      name: trimmedName || trimmedEmail.split('@')[0],
      password: trimmedPassword,
    };

    saveAccounts([...accounts, account]);
    setSession(account);
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

