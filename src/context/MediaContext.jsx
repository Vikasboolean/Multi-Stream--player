import { createContext, useContext, useState, useEffect } from 'react';
import { sampleMedia } from '../data/sampleData';

const MediaContext = createContext();

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within MediaProvider');
  }
  return context;
};

export const MediaProvider = ({ children }) => {
  const [media, setMedia] = useState(sampleMedia);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [watchLater, setWatchLater] = useState(() => {
    const saved = localStorage.getItem('watchLater');
    return saved ? JSON.parse(saved) : [];
  });
  const [continueWatching, setContinueWatching] = useState(() => {
    const saved = localStorage.getItem('continueWatching');
    return saved ? JSON.parse(saved) : [];
  });
  const [uploadedMedia, setUploadedMedia] = useState([]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('watchLater', JSON.stringify(watchLater));
  }, [watchLater]);

  useEffect(() => {
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
  }, [continueWatching]);

  const addToFavorites = (item) => {
    if (!favorites.find(fav => fav.id === item.id)) {
      setFavorites([...favorites, item]);
    }
  };

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const addToWatchLater = (item) => {
    if (!watchLater.find(w => w.id === item.id)) {
      setWatchLater([...watchLater, item]);
    }
  };

  const removeFromWatchLater = (id) => {
    setWatchLater(watchLater.filter(w => w.id !== id));
  };

  const updateContinueWatching = (item, progress) => {
    const existing = continueWatching.find(cw => cw.id === item.id);
    if (existing) {
      setContinueWatching(
        continueWatching.map(cw =>
          cw.id === item.id ? { ...cw, progress } : cw
        )
      );
    } else {
      setContinueWatching([...continueWatching, { ...item, progress }]);
    }
  };

  const addUploadedMedia = (item) => {
    const newItem = {
      ...item,
      id: Date.now(),
      views: 0,
      likes: 0,
    };
    setUploadedMedia([...uploadedMedia, newItem]);
    setMedia([...media, newItem]);
  };

  const isFavorite = (id) => favorites.some(fav => fav.id === id);
  const isWatchLater = (id) => watchLater.some(w => w.id === id);

  return (
    <MediaContext.Provider
      value={{
        media,
        favorites,
        watchLater,
        continueWatching,
        uploadedMedia,
        addToFavorites,
        removeFromFavorites,
        addToWatchLater,
        removeFromWatchLater,
        updateContinueWatching,
        addUploadedMedia,
        isFavorite,
        isWatchLater,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

