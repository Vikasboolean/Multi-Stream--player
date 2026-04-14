import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [loading, user, from, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (isLogin) {
      const result = login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } else {
      const result = signup(email, password, name);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Signup failed');
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin
              ? 'Sign in to continue'
              : 'Sign up to start streaming'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            Continue as guest
          </Link>
        </div>
        {isLogin && (
          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            Demo: demo@mediastream.com / demo123
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;

