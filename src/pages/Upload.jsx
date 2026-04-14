import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { motion } from 'framer-motion';
import { FiFilm, FiImage, FiMusic, FiLink, FiUploadCloud } from 'react-icons/fi';

const TYPE_OPTIONS = [
  { value: 'video', label: 'Video', icon: FiFilm, hint: 'MP4, WebM, etc.' },
  { value: 'image', label: 'Image', icon: FiImage, hint: 'JPG, PNG, WebP, etc.' },
  { value: 'audio', label: 'Audio', icon: FiMusic, hint: 'MP3, WAV, etc.' },
];

const Upload = () => {
  const { addUploadedMedia } = useMedia();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const blobUrlRef = useRef(null);

  const [source, setSource] = useState('file');
  const [fileName, setFileName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Movies',
    type: 'video',
    url: '',
    thumbnail: '',
    duration: '',
    artist: '',
  });
  const [error, setError] = useState('');

  const revokeDraftBlob = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const setType = (type) => {
    revokeDraftBlob();
    setFileName('');
    setFormData((prev) => ({
      ...prev,
      type,
      url: '',
      thumbnail: '',
      category:
        type === 'image'
          ? 'Images'
          : type === 'audio'
            ? 'Music'
            : prev.category === 'Images' || prev.category === 'Music'
              ? 'Movies'
              : prev.category,
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const setSourceMode = (mode) => {
    if (mode === source) return;
    revokeDraftBlob();
    setFileName('');
    setFormData((prev) => ({ ...prev, url: '', thumbnail: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSource(mode);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    revokeDraftBlob();
    if (!file) {
      setFileName('');
      setFormData((prev) => ({ ...prev, url: '', thumbnail: '' }));
      return;
    }

    const { type } = formData;
    const isVideo = type === 'video' && file.type.startsWith('video/');
    const isImage = type === 'image' && file.type.startsWith('image/');
    const isAudio = type === 'audio' && file.type.startsWith('audio/');

    if (!isVideo && !isImage && !isAudio) {
      setError(`Please choose a ${type} file.`);
      setFileName('');
      e.target.value = '';
      return;
    }

    setError('');
    const objectUrl = URL.createObjectURL(file);
    blobUrlRef.current = objectUrl;
    setFileName(file.name);
    setFormData((prev) => {
      const base = file.name.replace(/\.[^/.]+$/, '') || prev.title;
      const next = {
        ...prev,
        url: objectUrl,
        title: prev.title.trim() ? prev.title : base,
      };
      if (type === 'image') {
        next.thumbnail = objectUrl;
      }
      return next;
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (source === 'file' && !formData.url) {
      setError('Select a file to upload');
      return;
    }

    if (source === 'url') {
      const u = formData.url.trim();
      if (!u) {
        setError('Media URL is required');
        return;
      }
      try {
        const parsed = new URL(u);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          setError('Use an http(s) link');
          return;
        }
      } catch {
        setError('Enter a valid URL');
        return;
      }
    }

    const thumbTrim = formData.thumbnail.trim();
    const defaultPoster =
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400';
    const defaultAudioArt =
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400';

    let thumbnail = thumbTrim || formData.url;
    if (formData.type === 'image') {
      thumbnail = thumbTrim || formData.url;
    } else if (formData.type === 'video' && !thumbTrim) {
      thumbnail = defaultPoster;
    } else if (formData.type === 'audio' && !thumbTrim) {
      thumbnail = defaultAudioArt;
    }

    const payload = {
      ...formData,
      thumbnail,
    };

    blobUrlRef.current = null;
    addUploadedMedia(payload);
    navigate('/');
  };

  const accept =
    formData.type === 'video'
      ? 'video/*'
      : formData.type === 'image'
        ? 'image/*'
        : 'audio/*';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upload media
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Choose video or image (or audio), then upload a file from your device or paste a link.
          </p>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              What are you uploading?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TYPE_OPTIONS.map(({ value, label, icon: Icon, hint }) => {
                const active = formData.type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value)}
                    className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                      active
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 mb-2 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                    />
                    <span
                      className={`font-semibold ${active ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Source
            </p>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={() => setSourceMode('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  source === 'file'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FiUploadCloud className="w-4 h-4" />
                Upload file
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('url')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  source === 'url'
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <FiLink className="w-4 h-4" />
                Paste link
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {source === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File from device
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  onChange={handleFileChange}
                  className="hidden"
                  id="upload-file-input"
                />
                <label
                  htmlFor="upload-file-input"
                  className="flex flex-col items-center justify-center w-full min-h-[140px] px-4 py-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                >
                  <FiUploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to choose a file from your device
                  </span>
                  {fileName && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 mt-2 truncate max-w-full">
                      {fileName}
                    </span>
                  )}
                </label>
              </div>
            )}

            {source === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Media URL *
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder={
                    formData.type === 'video'
                      ? 'https://example.com/video.mp4'
                      : formData.type === 'image'
                        ? 'https://example.com/photo.jpg'
                        : 'https://example.com/track.mp3'
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Movies">Movies</option>
                <option value="Music">Music</option>
                <option value="Images">Images</option>
                <option value="Short Clips">Short Clips</option>
                <option value="Documentaries">Documentaries</option>
              </select>
            </div>

            {(formData.type === 'video' || formData.type === 'audio') && source === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.type === 'video' && source === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail URL (optional)
                </label>
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="Poster image — leave empty for default frame in player"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {formData.type === 'audio' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Artist
                </label>
                <input
                  type="text"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {(formData.type === 'video' || formData.type === 'audio') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (e.g., 3:45)
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="3:45"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Add to library
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
