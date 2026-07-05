import { useRef, useState, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize, FiHeart, FiClock } from 'react-icons/fi';

const VideoPlayer = ({ media, onClose }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const { addToFavorites, removeFromFavorites, addToWatchLater, updateContinueWatching, isFavorite, isWatchLater } = useMedia();

  const isFav = isFavorite(media.id);
  const isWatch = isWatchLater(media.id);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        updateContinueWatching(media, progress);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, media, updateContinueWatching]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (video) {
      video.currentTime = pos * video.duration;
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(window.controlsTimeout);
    window.controlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={media.url}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end">
          <div className="px-3 pb-3 space-y-2 sm:px-4 sm:pb-4">
            <div
              className="w-full h-2 bg-gray-700 rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-blue-500 rounded-full transition-all group-hover:h-3"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <FiPause className="w-6 h-6" />
                  ) : (
                    <FiPlay className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <FiVolumeX className="w-6 h-6" />
                  ) : (
                    <FiVolume2 className="w-6 h-6" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-20 sm:w-24"
                />

                <span className="text-xs sm:text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button
                  onClick={() => {
                    if (isFav) removeFromFavorites(media.id);
                    else addToFavorites(media);
                  }}
                  className={`p-2 hover:bg-white/20 rounded-full transition-colors ${
                    isFav ? 'text-red-500' : ''
                  }`}
                >
                  <FiHeart className={`w-6 h-6 ${isFav ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => {
                    if (!isWatch) addToWatchLater(media);
                  }}
                  className={`p-2 hover:bg-white/20 rounded-full transition-colors ${
                    isWatch ? 'text-blue-500' : ''
                  }`}
                >
                  <FiClock className="w-6 h-6" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  {isFullscreen ? (
                    <FiMinimize className="w-6 h-6" />
                  ) : (
                    <FiMaximize className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="px-3 py-2 sm:px-4 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 right-3 text-white sm:top-4 sm:left-4 sm:right-auto">
        <h2 className="text-lg sm:text-2xl font-bold line-clamp-2">{media.title}</h2>
        <p className="hidden text-sm text-gray-300 sm:block">{media.description}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;

