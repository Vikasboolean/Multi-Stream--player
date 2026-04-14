import { Link } from 'react-router-dom';
import { FiPlay, FiHeart, FiClock, FiImage, FiMusic, FiFilm } from 'react-icons/fi';
import { useMedia } from '../context/MediaContext';
import { motion } from 'framer-motion';

const MediaCard = ({ item, viewMode = 'grid' }) => {
  const { addToFavorites, removeFromFavorites, addToWatchLater, isFavorite, isWatchLater } = useMedia();
  const isFav = isFavorite(item.id);
  const isWatch = isWatchLater(item.id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const handleWatchLater = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWatch) {
      // Could add remove functionality if needed
    } else {
      addToWatchLater(item);
    }
  };

  const getIcon = () => {
    if (item.type === 'video') return <FiFilm className="w-5 h-5" />;
    if (item.type === 'audio') return <FiMusic className="w-5 h-5" />;
    return <FiImage className="w-5 h-5" />;
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to={`/player/${item.type}/${item.id}`}
          className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
        >
          <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <FiPlay className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {item.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {item.duration}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    {getIcon()}
                    <span>{item.category}</span>
                  </span>
                  <span>{item.views?.toLocaleString()} views</span>
                  {item.artist && <span>by {item.artist}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFav
                  ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleWatchLater}
              className={`p-2 rounded-lg transition-colors ${
                isWatch
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900'
              }`}
            >
              <FiClock className="w-5 h-5" />
            </button>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link
        to={`/player/${item.type}/${item.id}`}
        className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FiPlay className="w-8 h-8 text-blue-600 ml-1" />
            </div>
          </div>
          {item.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {item.duration}
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
            {getIcon()}
            <span>{item.category}</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span>{item.views?.toLocaleString()} views</span>
              {item.artist && <span>{item.artist}</span>}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-lg transition-colors ${
                  isFav
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <FiHeart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleWatchLater}
                className={`p-2 rounded-lg transition-colors ${
                  isWatch
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <FiClock className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MediaCard;

