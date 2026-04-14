const LOCAL_SIGNALING_URL = 'ws://localhost:3001';

function getDefaultSignalingUrl() {
  if (typeof window === 'undefined') return LOCAL_SIGNALING_URL;

  const { protocol, hostname, host } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost) return LOCAL_SIGNALING_URL;

  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${host}`;
}

export function getSignalingUrl() {
  return import.meta.env.VITE_SIGNALING_URL || getDefaultSignalingUrl();
}

export function createSignalingSocket() {
  const ws = new WebSocket(getSignalingUrl());
  return ws;
}

