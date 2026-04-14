import http from 'http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

/**
 * Rooms:
 * - broadcaster: socketId (single)
 * - viewers: Map<viewerSocketId, true>
 */
const rooms = new Map();

const server = http.createServer((_, res) => {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('MediaStream signaling server running.\n');
});

const wss = new WebSocketServer({ server });

const send = (ws, msg) => {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
};

const getViewerCount = (room) => room?.viewers?.size || 0;

const getLiveRooms = () =>
  Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId,
    title: room.title,
    viewerCount: getViewerCount(room),
  }));

const broadcastToRoom = (roomId, msg, exceptSocketId = null) => {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const [socketId, client] of clients.entries()) {
    if (exceptSocketId && socketId === exceptSocketId) continue;
    if (client.roomId === roomId) send(client.ws, msg);
  }
};

const broadcastLiveRooms = () => {
  const liveRooms = getLiveRooms();
  for (const client of clients.values()) {
    send(client.ws, { type: 'live-rooms', liveRooms });
  }
};

const clients = new Map(); // socketId -> { ws, role, roomId }

wss.on('connection', (ws) => {
  const socketId = randomUUID();
  clients.set(socketId, { ws, role: null, roomId: null });
  send(ws, { type: 'hello', socketId });

  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(String(raw));
    } catch {
      return;
    }

    const client = clients.get(socketId);
    if (!client) return;

    const { type, roomId, targetId } = data || {};

    if (type === 'create-room') {
      const id = roomId || randomUUID();
      const title = String(data.title || '').trim() || 'Untitled live stream';
      rooms.set(id, { broadcaster: socketId, title, viewers: new Map() });
      client.role = 'broadcaster';
      client.roomId = id;
      send(ws, { type: 'room-created', roomId: id, title, viewerCount: 0 });
      broadcastLiveRooms();
      return;
    }

    if (type === 'list-live-rooms') {
      send(ws, { type: 'live-rooms', liveRooms: getLiveRooms() });
      return;
    }

    if (type === 'join-room') {
      const room = rooms.get(roomId);
      if (!room) {
        send(ws, { type: 'room-error', roomId, error: 'Room not found' });
        return;
      }
      client.role = 'viewer';
      client.roomId = roomId;
      room.viewers.set(socketId, true);
      const viewerCount = getViewerCount(room);
      send(ws, { type: 'joined-room', roomId, title: room.title, viewerCount });
      // notify broadcaster that a viewer joined
      const broadcaster = clients.get(room.broadcaster);
      if (broadcaster) {
        send(broadcaster.ws, { type: 'viewer-joined', roomId, viewerId: socketId, title: room.title, viewerCount });
      }
      broadcastToRoom(roomId, { type: 'viewer-count', roomId, viewerCount });
      broadcastLiveRooms();
      return;
    }

    // signaling relay: offer/answer/ice
    if (type === 'signal' && roomId && targetId) {
      const target = clients.get(targetId);
      if (!target) return;
      send(target.ws, { type: 'signal', roomId, fromId: socketId, payload: data.payload });
      return;
    }

    // broadcaster can end stream
    if (type === 'end-room' && roomId) {
      const room = rooms.get(roomId);
      if (room?.broadcaster !== socketId) return;
      broadcastToRoom(roomId, { type: 'room-ended', roomId }, socketId);
      rooms.delete(roomId);
      broadcastLiveRooms();
      return;
    }
  });

  ws.on('close', () => {
    const client = clients.get(socketId);
    clients.delete(socketId);
    if (!client?.roomId) return;

    const room = rooms.get(client.roomId);
    if (!room) return;

    if (room.broadcaster === socketId) {
      // end room if broadcaster leaves
      broadcastToRoom(client.roomId, { type: 'room-ended', roomId: client.roomId }, socketId);
      rooms.delete(client.roomId);
      broadcastLiveRooms();
      return;
    }

    room.viewers.delete(socketId);
    const viewerCount = getViewerCount(room);
    // notify broadcaster viewer left (optional)
    const broadcaster = clients.get(room.broadcaster);
    if (broadcaster) {
      send(broadcaster.ws, { type: 'viewer-left', roomId: client.roomId, viewerId: socketId, viewerCount });
    }
    broadcastToRoom(client.roomId, { type: 'viewer-count', roomId: client.roomId, viewerCount });
    broadcastLiveRooms();
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Signaling server listening on http://localhost:${PORT}`);
});

