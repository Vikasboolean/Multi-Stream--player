const STORAGE_KEY = 'activeLiveRooms';
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

const now = () => Date.now();

const isFreshRoom = (room) =>
  room?.roomId && now() - (room.updatedAt || room.startedAt || 0) < ROOM_TTL_MS;

const notifyLiveRoomsChanged = () => {
  window.dispatchEvent(new Event('live-rooms-updated'));
};

export const getStoredLiveRooms = () => {
  try {
    const rooms = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(rooms)) return [];
    return rooms.filter(isFreshRoom);
  } catch {
    return [];
  }
};

const saveStoredLiveRooms = (rooms) => {
  const freshRooms = rooms.filter(isFreshRoom);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(freshRooms));
  notifyLiveRoomsChanged();
};

export const registerLiveRoom = ({ roomId, title, viewerCount = 0 }) => {
  if (!roomId) return;
  const rooms = getStoredLiveRooms();
  const existing = rooms.find((room) => room.roomId === roomId);
  const nextRoom = {
    roomId,
    title: title || existing?.title || 'Untitled live stream',
    viewerCount,
    startedAt: existing?.startedAt || now(),
    updatedAt: now(),
  };

  saveStoredLiveRooms([
    ...rooms.filter((room) => room.roomId !== roomId),
    nextRoom,
  ]);
};

export const unregisterLiveRoom = (roomId) => {
  if (!roomId) return;
  saveStoredLiveRooms(getStoredLiveRooms().filter((room) => room.roomId !== roomId));
};

export const mergeLiveRooms = (...roomGroups) => {
  const roomsById = new Map();
  for (const group of roomGroups) {
    for (const room of group || []) {
      if (!room?.roomId) continue;
      roomsById.set(room.roomId, {
        ...roomsById.get(room.roomId),
        ...room,
        viewerCount: room.viewerCount || 0,
      });
    }
  }
  return Array.from(roomsById.values());
};
