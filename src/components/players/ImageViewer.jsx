import { useState, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
import { FiX, FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiHeart, FiClock, FiMaximize2 } from 'react-icons/fi';

const ImageViewer = ({ media, images = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { addToFavorites, removeFromFavorites, addToWatchLater, isFavorite, isWatchLater } = useMedia();

  const imageList = images.length > 0 ? images : [media];
  const currentImage = imageList[currentIndex];
  const isFav = isFavorite(currentImage.id);
  const isWatch = isWatchLater(currentImage.id);

  useEffect(() => {
    if (isSlideshow && imageList.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % imageList.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isSlideshow, imageList.length]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, isFullscreen]);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={currentImage.url}
          alt={currentImage.title}
          className="max-w-full max-h-full object-contain"
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
        >
          <FiX className="w-6 h-6" />
        </button>

        {imageList.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-4 z-10">
          <div className="text-white text-center">
            <h3 className="text-lg font-semibold">{currentImage.title}</h3>
            <p className="text-sm text-gray-300">{currentImage.description}</p>
            {imageList.length > 1 && (
              <p className="text-xs text-gray-400 mt-1">
                {currentIndex + 1} / {imageList.length}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 border-l border-white/20 pl-4">
            {imageList.length > 1 && (
              <button
                onClick={() => setIsSlideshow(!isSlideshow)}
                className={`p-2 rounded-lg transition-colors ${
                  isSlideshow
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isSlideshow ? (
                  <FiPause className="w-5 h-5" />
                ) : (
                  <FiPlay className="w-5 h-5" />
                )}
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <FiMaximize2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (isFav) removeFromFavorites(currentImage.id);
                else addToFavorites(currentImage);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isFav
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (!isWatch) addToWatchLater(currentImage);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isWatch
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <FiClock className="w-5 h-5" />
            </button>
          </div>
        </div>

        {imageList.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {imageList.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-blue-500'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;

