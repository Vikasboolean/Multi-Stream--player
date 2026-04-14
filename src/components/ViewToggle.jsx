import { FiGrid, FiList } from 'react-icons/fi';

const ViewToggle = ({ viewMode, onToggle }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => onToggle('grid')}
        className={`p-2 rounded transition-colors ${
          viewMode === 'grid'
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        aria-label="Grid view"
      >
        <FiGrid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onToggle('list')}
        className={`p-2 rounded transition-colors ${
          viewMode === 'list'
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        aria-label="List view"
      >
        <FiList className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewToggle;

