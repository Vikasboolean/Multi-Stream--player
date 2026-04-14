import { useMedia } from '../context/MediaContext';
import MediaCard from '../components/MediaCard';
import ViewToggle from '../components/ViewToggle';
import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';

const Favorites = () => {
  const { favorites } = useMedia();
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <FiHeart className="w-8 h-8 text-red-500" />
            <span>My Favorites</span>
          </h1>
          <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
        </div>

        {favorites.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {favorites.map((item) => (
              <MediaCard key={item.id} item={item} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No favorites yet. Start adding media to your favorites!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

