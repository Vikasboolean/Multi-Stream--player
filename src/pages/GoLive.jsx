import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCamera, FiCopy, FiMic, FiRadio, FiSlash, FiUsers, FiVideo, FiX } from 'react-icons/fi';
import { createSignalingSocket } from '../lib/signaling';
import { registerLiveRoom, unregisterLiveRoom } from '../lib/liveRooms';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

const GoLive = () => {
  const { roomId: roomIdParam } = useParams();

  const [roomId, setRoomId] = useState(roomIdParam || '');
  const [status, setStatus] = useState('idle'); // idle | starting | live | ended | error
  const [error, setError] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamTitle, setStreamTitle] = useState('');

  const wsRef = useRef(null);
  const socketIdRef = useRef(null);
  const activeRoomIdRef = useRef('');
  const streamTitleRef = useRef('');
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map()); // viewerId -> RTCPeerConnection
  const localVideoRef = useRef(null);

  const shareUrl = useMemo(() => {
    if (!roomId) return '';
    return `${window.location.origin}/live/watch/${roomId}`;
  }, [roomId]);

  const readViewerCount = (msg, fallback) =>
    Number.isFinite(msg.viewerCount) ? msg.viewerCount : fallback;

  const cleanup = () => {
    unregisterLiveRoom(activeRoomIdRef.current);
    activeRoomIdRef.current = '';

    for (const pc of peersRef.current.values()) {
      try {
        pc.close();
      } catch {
        // ignore
      }
    }
    peersRef.current.clear();
    setViewerCount(0);

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }

    if (localStreamRef.current) {
      for (const t of localStreamRef.current.getTracks()) t.stop();
      localStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTrackEnabled = (kind, enabled) => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getTracks()) {
      if (track.kind === kind) track.enabled = enabled;
    }
  };

  useEffect(() => setTrackEnabled('audio', micOn), [micOn]);
  useEffect(() => setTrackEnabled('video', camOn), [camOn]);

  const startLive = async () => {
    setError('');

    const title = window.prompt('Enter a title for your live stream:', streamTitle || '');
    if (title === null) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Stream title is required.');
      return;
    }

    setStreamTitle(trimmedTitle);
    streamTitleRef.current = trimmedTitle;
    setStatus('starting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const ws = createSignalingSocket();
      wsRef.current = ws;

      ws.onmessage = async (ev) => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }

        if (msg.type === 'hello') {
          socketIdRef.current = msg.socketId;
          const wantedRoomId = roomIdParam || roomId || undefined;
          ws.send(JSON.stringify({ type: 'create-room', roomId: wantedRoomId, title: streamTitleRef.current }));
          return;
        }

        if (msg.type === 'room-created') {
          setRoomId(msg.roomId);
          activeRoomIdRef.current = msg.roomId;
          setStreamTitle(msg.title || streamTitleRef.current);
          streamTitleRef.current = msg.title || streamTitleRef.current;
          const nextViewerCount = readViewerCount(msg, 0);
          setViewerCount(nextViewerCount);
          registerLiveRoom({ roomId: msg.roomId, title: streamTitleRef.current, viewerCount: nextViewerCount });
          setStatus('live');
          return;
        }

        if (msg.type === 'viewer-joined') {
          const viewerId = msg.viewerId;
          const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
          peersRef.current.set(viewerId, pc);
          const nextViewerCount = readViewerCount(msg, peersRef.current.size);
          setViewerCount(nextViewerCount);
          registerLiveRoom({ roomId: msg.roomId || activeRoomIdRef.current, title: streamTitleRef.current, viewerCount: nextViewerCount });

          const streamLocal = localStreamRef.current;
          if (streamLocal) {
            for (const track of streamLocal.getTracks()) {
              pc.addTrack(track, streamLocal);
            }
          }

          pc.onicecandidate = (e) => {
            if (!e.candidate) return;
            ws.send(
              JSON.stringify({
                type: 'signal',
                roomId: msg.roomId,
                targetId: viewerId,
                payload: { kind: 'ice', candidate: e.candidate },
              })
            );
          };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws.send(
            JSON.stringify({
              type: 'signal',
              roomId: msg.roomId,
              targetId: viewerId,
              payload: { kind: 'offer', sdp: offer },
            })
          );
          return;
        }

        if (msg.type === 'viewer-left') {
          const viewerId = msg.viewerId;
          const pc = peersRef.current.get(viewerId);
          if (pc) {
            try {
              pc.close();
            } catch {
              // ignore
            }
            peersRef.current.delete(viewerId);
          }
          const nextViewerCount = readViewerCount(msg, peersRef.current.size);
          setViewerCount(nextViewerCount);
          registerLiveRoom({ roomId: msg.roomId || activeRoomIdRef.current, title: streamTitleRef.current, viewerCount: nextViewerCount });
          return;
        }

        if (msg.type === 'viewer-count') {
          const nextViewerCount = readViewerCount(msg, peersRef.current.size);
          setViewerCount(nextViewerCount);
          registerLiveRoom({ roomId: msg.roomId || activeRoomIdRef.current, title: streamTitleRef.current, viewerCount: nextViewerCount });
          return;
        }

        if (msg.type === 'signal') {
          const fromId = msg.fromId;
          const payload = msg.payload;
          const pc = peersRef.current.get(fromId);
          if (!pc) return;

          if (payload?.kind === 'answer') {
            await pc.setRemoteDescription(payload.sdp);
          } else if (payload?.kind === 'ice' && payload.candidate) {
            try {
              await pc.addIceCandidate(payload.candidate);
            } catch {
              // ignore
            }
          }
          return;
        }

        if (msg.type === 'room-ended') {
          setStatus('ended');
          cleanup();
        }
      };

      ws.onerror = () => {
        setError('Signaling server error. Is the live server running?');
        setStatus('error');
      };

      ws.onclose = () => {
        // If we were live and socket closes, keep local preview but show ended.
        setStatus((s) => (s === 'live' ? 'ended' : s));
      };
    } catch (e) {
      setError(e?.message || 'Could not access camera/microphone.');
      setStatus('error');
    }
  };

  const endLive = () => {
    const ws = wsRef.current;
    if (ws && roomId) {
      try {
        ws.send(JSON.stringify({ type: 'end-room', roomId }));
      } catch {
        // ignore
      }
    }
    setStatus('ended');
    cleanup();
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                to="/live"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Back
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiRadio className="w-7 h-7" />
                Go Live
              </h1>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Start streaming from your device and share the watch link.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black shadow-lg">
              {(status === 'live' || status === 'starting') && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white border border-white/20 backdrop-blur-md">
                    <FiUsers className="w-3.5 h-3.5" />
                    {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
                  </span>
                  {streamTitle && (
                    <span className="inline-flex max-w-[260px] items-center rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white border border-white/20 backdrop-blur-md truncate">
                      {streamTitle}
                    </span>
                  )}
                </div>
              )}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-video object-cover"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCamOn((v) => !v)}
                disabled={status !== 'live' && status !== 'starting'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
              >
                <FiCamera className="w-4 h-4" />
                {camOn ? 'Camera on' : 'Camera off'}
              </button>
              <button
                type="button"
                onClick={() => setMicOn((v) => !v)}
                disabled={status !== 'live' && status !== 'starting'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
              >
                <FiMic className="w-4 h-4" />
                {micOn ? 'Mic on' : 'Mic off'}
              </button>

              {status === 'idle' || status === 'error' || status === 'ended' ? (
                <button
                  type="button"
                  onClick={startLive}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                >
                  <FiVideo className="w-4 h-4" />
                  Start Live Stream
                </button>
              ) : (
                <button
                  type="button"
                  onClick={endLive}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-black transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  End Stream
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Watch link
            </p>
            {roomId ? (
              <>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-900 dark:text-white break-all">
                  {shareUrl}
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  <FiCopy className="w-4 h-4" />
                  Copy link
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click <span className="font-semibold">Start Live Stream</span> to generate a link.
              </p>
            )}

            <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Live viewers
              </p>
              <div className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                <FiUsers className="w-5 h-5 text-red-600" />
                {viewerCount}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Notes
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex gap-2">
                  <FiSlash className="w-4 h-4 mt-0.5" />
                  Viewers must keep this tab open while streaming.
                </li>
                <li className="flex gap-2">
                  <FiSlash className="w-4 h-4 mt-0.5" />
                  For real internet streaming, you’ll need HTTPS + public signaling server.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoLive;

