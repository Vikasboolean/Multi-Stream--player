const DEFAULT_SIGNALING_URL = 'ws://localhost:3001';

export function getSignalingUrl() {
  return import.meta.env.VITE_SIGNALING_URL || DEFAULT_SIGNALING_URL;
}

export function createSignalingSocket() {
  const ws = new WebSocket(getSignalingUrl());
  return ws;
}

