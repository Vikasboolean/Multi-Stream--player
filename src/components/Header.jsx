import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';
import { FiSun, FiMoon, FiSearch, FiUser, FiLogOut, FiFilm } from 'react-icons/fi';

const REEL_ROOM_URL = 'https://reel-room-ebon.vercel.app/';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center space-x-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-purple-60 rounded-lg flex flex-shrink-0 items-center justify-center">
              <img src="icon1.png" alt="logo" srcSet="" />
            </div>
            <span className="truncate text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              MediaStream
            </span>
          </Link>

          <div className="order-3 w-full sm:order-2 sm:flex-1 sm:max-w-2xl sm:mx-4">
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

          <div className="order-2 flex flex-shrink-0 items-center gap-2 sm:order-3 sm:gap-4">
            <a
              href={REEL_ROOM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:px-4"
              aria-label="Open Reel Room"
              title="Open Reel Room"
            >
              <FiFilm className="h-5 w-5 flex-shrink-0" />
            </a>

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
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/upload"
                  className="px-3 py-2 sm:px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                >
                  Upload
                </Link>
                <div className="hidden min-w-0 items-center space-x-2 md:flex">
                  <FiUser className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="max-w-32 truncate text-sm text-gray-700 dark:text-gray-300">
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
                className="px-3 py-2 sm:px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
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

