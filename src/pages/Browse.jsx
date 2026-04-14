import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMedia } from '../context/MediaContext';
import { useSearch } from '../context/SearchContext';
import MediaCard from '../components/MediaCard';
import CategoryFilter from '../components/CategoryFilter';
import ViewToggle from '../components/ViewToggle';
import { FiRadio, FiTrash2, FiUsers } from 'react-icons/fi';
import { createSignalingSocket } from '../lib/signaling';
import { getStoredLiveRooms, mergeLiveRooms, unregisterLiveRoom } from '../lib/liveRooms';

const Browse = () => {
  const { media } = useMedia();
  const { searchQuery, setSearchQuery } = useSearch();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [liveRooms, setLiveRooms] = useState([]);
  const [serverLiveRooms, setServerLiveRooms] = useState([]);
  const [showLiveStreams, setShowLiveStreams] = useState(false);
  const liveRoomsSocketRef = useRef(null);
  const serverLiveRoomsRef = useRef([]);
  const dismissedRoomIdsRef = useRef(new Set());
  const navigate = useNavigate();

  const setVisibleLiveRooms = (rooms) => {
    setLiveRooms(rooms.filter((room) => !dismissedRoomIdsRef.current.has(room.roomId)));
  };

  const refreshLiveRooms = (serverRooms = serverLiveRoomsRef.current) => {
    setVisibleLiveRooms(mergeLiveRooms(getStoredLiveRooms(), serverRooms));
  };

  const requestLiveRooms = () => {
    refreshLiveRooms();
    const ws = liveRoomsSocketRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'list-live-rooms' }));
    }
  };

  const toggleLiveStreams = () => {
    setShowLiveStreams((visible) => {
      if (!visible) requestLiveRooms();
      return !visible;
    });
  };

  const deleteLiveRoom = (roomId) => {
    dismissedRoomIdsRef.current.add(roomId);
    unregisterLiveRoom(roomId);
    refreshLiveRooms();
  };

  useEffect(() => {
    let cancelled = false;
    let ws;

    try {
      ws = createSignalingSocket();
      liveRoomsSocketRef.current = ws;
    } catch {
      return undefined;
    }

    ws.onopen = () => {
      requestLiveRooms();
    };

    ws.onmessage = (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }

      if (!cancelled && msg.type === 'live-rooms') {
        const nextServerRooms = Array.isArray(msg.liveRooms) ? msg.liveRooms : [];
        serverLiveRoomsRef.current = nextServerRooms;
        setServerLiveRooms(nextServerRooms);
        setVisibleLiveRooms(mergeLiveRooms(getStoredLiveRooms(), nextServerRooms));
      }
    };

    ws.onerror = () => {
      if (!cancelled) refreshLiveRooms([]);
    };

    ws.onclose = () => {
      if (!cancelled) refreshLiveRooms([]);
    };

    const handleLiveRoomsChanged = () => refreshLiveRooms();
    window.addEventListener('live-rooms-updated', handleLiveRoomsChanged);
    window.addEventListener('storage', handleLiveRoomsChanged);
    window.addEventListener('focus', handleLiveRoomsChanged);

    return () => {
      cancelled = true;
      window.removeEventListener('live-rooms-updated', handleLiveRoomsChanged);
      window.removeEventListener('storage', handleLiveRoomsChanged);
      window.removeEventListener('focus', handleLiveRoomsChanged);
      try {
        ws.close();
      } catch {
        // ignore
      }
      if (liveRoomsSocketRef.current === ws) {
        liveRoomsSocketRef.current = null;
      }
    };
  }, []);

  const filteredMedia = useMemo(() => {
    let filtered = media;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.artist?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [media, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Browse Media
            </h1>
            <button
              type="button"
              onClick={() => navigate('/live')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors w-fit"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              Live Streaming
            </button>
            <button
              type="button"
              onClick={toggleLiveStreams}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold hover:bg-black dark:hover:bg-gray-200 transition-colors w-fit"
            >
              <FiRadio className="w-4 h-4" />
              {showLiveStreams ? 'Hide running streams' : 'Show running streams'}
              <span className="rounded-full bg-white/20 dark:bg-gray-900/10 px-2 py-0.5 text-xs">
                {liveRooms.length}
              </span>
            </button>
          </div>
          <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {showLiveStreams && (
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Running streams
              </h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 dark:bg-red-950/40 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                {liveRooms.length} active
              </span>
            </div>

            {liveRooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {liveRooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="group overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <Link
                      to={`/live/watch/${room.roomId}`}
                      className="relative aspect-video bg-gradient-to-br from-gray-950 via-red-950 to-gray-900 flex items-center justify-center"
                    >
                      <div className="absolute top-2 left-2 inline-flex items-center gap-2 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        LIVE
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteLiveRoom(room.roomId);
                        }}
                        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                        aria-label="Delete running stream"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                      <FiRadio className="w-14 h-14 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                    </Link>

                    <div className="p-4">
                      <Link to={`/live/watch/${room.roomId}`}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {room.title || 'Untitled live stream'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-all">
                          /live/watch/{room.roomId}
                        </p>
                      </Link>
                      <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <FiUsers className="w-4 h-4" />
                        {room.viewerCount || 0} {(room.viewerCount || 0) === 1 ? 'viewer' : 'viewers'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-6 text-center text-gray-600 dark:text-gray-400">
                No running streams right now.
              </div>
            )}
          </div>
        )}

        {filteredMedia.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {filteredMedia.map((item) => (
              <MediaCard key={item.id} item={item} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No media found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;

