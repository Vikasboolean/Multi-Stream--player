import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiActivity, FiArrowLeft, FiExternalLink, FiPlay, FiRadio, FiVideo } from 'react-icons/fi';

const liveChannels = [
  {
    id: 'live-1',
    title: 'Live News (Demo)',
    description: 'Demo HLS live stream',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    id: 'live-2',
    title: 'Sports (Demo)',
    description: 'Demo HLS stream (VOD-style)',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
  },
  {
    id: 'live-3',
    title: 'Music Live (Demo)',
    description: 'Demo HLS stream',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  },
];

const Live = () => {
  const [selectedLive, setSelectedLive] = useState(null);
  const [liveError, setLiveError] = useState('');
  const [customLiveUrl, setCustomLiveUrl] = useState('');
  const customUrlRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !selectedLive?.url) return undefined;

    let cancelled = false;
    setLiveError('');

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      try {
        video.pause();
      } catch {
        // ignore
      }
      video.removeAttribute('src');
      video.load();
    };

    cleanup();

    (async () => {
      try {
        const mod = await import('hls.js');
        const Hls = mod.default;

        if (cancelled) return;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = selectedLive.url;
          await video.play();
          return;
        }

        if (!Hls.isSupported()) {
          setLiveError('Your browser does not support HLS playback.');
          return;
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(selectedLive.url);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data?.fatal) {
            setLiveError('Stream failed to load. Try another channel or URL.');
            try {
              hls.destroy();
            } catch {
              // ignore
            }
            hlsRef.current = null;
          }
        });
      } catch {
        setLiveError('Live player failed to initialize.');
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [selectedLive]);

  const startCustomLive = () => {
    setLiveError('');
    const url = customLiveUrl.trim();
    if (!url) {
      setLiveError('Paste a live stream URL (HLS .m3u8).');
      return;
    }
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setLiveError('Use an http(s) link.');
        return;
      }
    } catch {
      setLiveError('Enter a valid URL.');
      return;
    }
    setSelectedLive({
      id: `custom-${Date.now()}`,
      title: 'Custom Live Stream',
      description: 'Your HLS URL',
      url,
    });
  };

  const startFromHeroCard = () => {
    // If user already pasted a URL, use it; otherwise start the first demo channel.
    if (customLiveUrl.trim()) {
      startCustomLive();
      return;
    }
    if (liveChannels[0]) {
      setSelectedLive(liveChannels[0]);
      return;
    }
    customUrlRef.current?.focus?.();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiRadio className="w-7 h-7" />
                Live Streaming
              </h1>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Select a live channel or paste your HLS `.m3u8` URL to start streaming.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Go live from your device
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Use your camera/microphone to broadcast, then share a link for others to watch.
              </p>
              <Link
                to="/live/go"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                <FiVideo className="w-4 h-4" />
                Start live from device
                <FiExternalLink className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-black shadow-lg">
              {selectedLive ? (
                <>
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-md border border-white/20">
                      <FiActivity className="w-3.5 h-3.5" />
                      {selectedLive.title}
                    </span>
                  </div>
                  <video
                    ref={videoRef}
                    className="w-full aspect-video object-contain"
                    controls
                    playsInline
                    autoPlay
                    muted
                  />
                  {liveError && (
                    <div className="absolute inset-x-0 bottom-0 bg-red-600/90 text-white text-sm px-4 py-3">
                      {liveError}
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={startFromHeroCard}
                  className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-gray-900 to-black hover:from-gray-800 hover:to-black transition-colors"
                >
                  <div className="text-center px-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                      <FiPlay className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white font-semibold">Start your live stream</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Click to start (demo) or play your pasted HLS URL.
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Your live stream URL (HLS)
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  ref={customUrlRef}
                  type="url"
                  placeholder="Paste .m3u8 URL (https://...)"
                  value={customLiveUrl}
                  onChange={(e) => setCustomLiveUrl(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={startCustomLive}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  Start streaming
                </button>
              </div>
              {liveError && !selectedLive && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{liveError}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Live channels
            </p>
            <div className="space-y-3">
              {liveChannels.map((ch) => {
                const active = selectedLive?.url === ch.url;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedLive(ch)}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                      active
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            LIVE
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {ch.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {ch.description}
                        </p>
                      </div>
                      <FiPlay className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Tip: For reliable live playback, use an HLS `.m3u8` URL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live;

