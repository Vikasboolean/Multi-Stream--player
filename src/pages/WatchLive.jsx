import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiPlay, FiRadio, FiUsers } from 'react-icons/fi';
import { createSignalingSocket } from '../lib/signaling';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

const WatchLive = () => {
  const { roomId } = useParams();
  const [status, setStatus] = useState('connecting'); // connecting | live | ended | error
  const [error, setError] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [streamTitle, setStreamTitle] = useState('');

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const videoRef = useRef(null);
  const intentionallyClosingRef = useRef(false);

  const title = useMemo(
    () => streamTitle || `Live Stream • ${roomId}`,
    [roomId, streamTitle]
  );
  const readViewerCount = (msg, fallback) =>
    Number.isFinite(msg.viewerCount) ? msg.viewerCount : fallback;

  const cleanup = () => {
    intentionallyClosingRef.current = true;
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {
        // ignore
      }
      pcRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    intentionallyClosingRef.current = false;
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
        ws.send(JSON.stringify({ type: 'join-room', roomId }));
        return;
      }

      if (msg.type === 'room-error') {
        if (msg.error === 'Room not found') {
          setError('');
          setStatus('ended');
          cleanup();
          return;
        }
        setError(msg.error || 'Could not load stream');
        setStatus('error');
        return;
      }

      if (msg.type === 'joined-room') {
        setStreamTitle(msg.title || '');
        setViewerCount(readViewerCount(msg, 1));
        return;
      }

      if (msg.type === 'viewer-count') {
        setViewerCount((currentCount) => readViewerCount(msg, currentCount));
        return;
      }

      if (msg.type === 'room-ended') {
        setError('');
        setStatus('ended');
        cleanup();
        return;
      }

      if (msg.type === 'signal') {
        const payload = msg.payload;
        if (!payload) return;

        if (!pcRef.current) {
          const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
          pcRef.current = pc;

          pc.ontrack = (event) => {
            const [stream] = event.streams;
            if (videoRef.current && stream) {
              videoRef.current.srcObject = stream;
              setStatus('live');
            }
          };

          pc.onicecandidate = (e) => {
            if (!e.candidate) return;
            ws.send(
              JSON.stringify({
                type: 'signal',
                roomId,
                targetId: msg.fromId,
                payload: { kind: 'ice', candidate: e.candidate },
              })
            );
          };
        }

        const pc = pcRef.current;

        if (payload.kind === 'offer') {
          await pc.setRemoteDescription(payload.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(
            JSON.stringify({
              type: 'signal',
              roomId,
              targetId: msg.fromId,
              payload: { kind: 'answer', sdp: answer },
            })
          );
        } else if (payload.kind === 'ice' && payload.candidate) {
          try {
            await pc.addIceCandidate(payload.candidate);
          } catch {
            // ignore
          }
        }
      }
    };

    ws.onerror = () => {
      setError('Signaling server error. Is the live server running?');
      setStatus('error');
    };

    ws.onclose = () => {
      if (!intentionallyClosingRef.current) {
        setError('Connection closed.');
        setStatus('error');
      }
    };

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

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
                Watch Live
              </h1>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 break-all">
              {title}
            </p>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black shadow-lg">
          {(status === 'connecting' || status === 'live') && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white border border-white/20 backdrop-blur-md">
                <FiUsers className="w-3.5 h-3.5" />
                {viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
              </span>
            </div>
          )}
          <video
            ref={videoRef}
            className="w-full aspect-video object-contain"
            autoPlay
            playsInline
            controls
          />
          {status === 'connecting' && (
            <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-sm px-4 py-3 flex items-center gap-2">
              <FiPlay className="w-4 h-4" />
              Connecting to live stream...
            </div>
          )}
        </div>

        {status === 'ended' && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-4 overflow-hidden rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm font-semibold"
          >
            <motion.span
              className="inline-block text-red-700 dark:text-red-300"
              initial={{ opacity: 0, x: -24 }}
              animate={{
                opacity: 1,
                x: [-24, 24, -16, 0],
                color: ['#b91c1c', '#dc2626', '#f97316', '#b91c1c'],
              }}
              transition={{
                opacity: { delay: 0.12, duration: 0.25 },
                x: { delay: 0.12, duration: 1.4, ease: 'easeInOut' },
                color: { delay: 0.12, duration: 1.4, ease: 'easeInOut' },
              }}
            >
              Stream ended
            </motion.span>
          </motion.div>
        )}

        {status === 'error' && (
          <div className="mt-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white flex items-start gap-2">
            <FiAlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <div className="font-semibold">Could not load stream</div>
              {error && <div className="text-gray-700 dark:text-gray-300 mt-1">{error}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchLive;

