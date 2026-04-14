import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { FiSun, FiMoon, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-60 rounded-lg flex items-center justify-center">
              <img src="icon1.png" alt="logo" srcset="" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              MediaStream
            </span>
          </Link>

          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <FiSun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/upload"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Upload
                </Link>
                <div className="flex items-center space-x-2">
                  <FiUser className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Logout"
                >
                  <FiLogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

