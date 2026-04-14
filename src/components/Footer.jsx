import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              MediaStream
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your ultimate destination for streaming videos, music, and images.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm transition-colors"
                >
                  Browse
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 text-sm transition-colors"
                >
                  Favorites
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-400 text-sm">Movies</li>
              <li className="text-gray-600 dark:text-gray-400 text-sm">Music</li>
              <li className="text-gray-600 dark:text-gray-400 text-sm">Images</li>
              <li className="text-gray-600 dark:text-gray-400 text-sm">Short Clips</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Connect
            </h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="GitHub"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                aria-label="LinkedIn"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2024 MediaStream. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

