import { useRef, useState, useEffect } from 'react';
import { useMedia } from '../../context/MediaContext';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiHeart, FiClock } from 'react-icons/fi';

const AudioPlayer = ({ media, playlist = [], onClose }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const { addToFavorites, removeFromFavorites, addToWatchLater, isFavorite, isWatchLater } = useMedia();

  const currentMedia = playlist.length > 0 ? playlist[currentTrackIndex] : media;
  const isFav = isFavorite(currentMedia.id);
  const isWatch = isWatchLater(currentMedia.id);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (playlist.length > 0 && currentTrackIndex < playlist.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, playlist.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && playlist.length > 0) {
      audio.src = currentMedia.url;
      if (isPlaying) {
        audio.play();
      }
    }
  }, [currentTrackIndex, currentMedia.url, playlist.length, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (audio) {
      audio.currentTime = pos * audio.duration;
    }
  };

  const nextTrack = () => {
    if (playlist.length > 0 && currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const prevTrack = () => {
    if (playlist.length > 0 && currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={currentMedia.thumbnail}
              alt={currentMedia.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {currentMedia.title}
          </h2>
          {currentMedia.artist && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {currentMedia.artist}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {currentMedia.description}
          </p>
        </div>

        <audio ref={audioRef} src={currentMedia.url} />

        <div className="space-y-4">
          <div
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={prevTrack}
              disabled={playlist.length === 0 || currentTrackIndex === 0}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <FiSkipBack className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              {isPlaying ? (
                <FiPause className="w-8 h-8" />
              ) : (
                <FiPlay className="w-8 h-8 ml-1" />
              )}
            </button>

            <button
              onClick={nextTrack}
              disabled={playlist.length === 0 || currentTrackIndex === playlist.length - 1}
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <FiSkipForward className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMuted ? (
                <FiVolumeX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <FiVolume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-32"
            />

            <button
              onClick={() => {
                if (isFav) removeFromFavorites(currentMedia.id);
                else addToFavorites(currentMedia);
              }}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                isFav ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (!isWatch) addToWatchLater(currentMedia);
              }}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                isWatch ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiClock className="w-5 h-5" />
            </button>
          </div>

          {playlist.length > 0 && (
            <div className="mt-6 max-h-48 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Playlist ({currentTrackIndex + 1} / {playlist.length})
              </h3>
              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => setCurrentTrackIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentTrackIndex
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{track.title}</p>
                        {track.artist && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {track.artist}
                          </p>
                        )}
                      </div>
                      {index === currentTrackIndex && isPlaying && (
                        <FiPlay className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;

