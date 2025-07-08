// client/src/components/ChatSidebar.jsx
import { useEffect, useState } from 'react';
import socket from '../socket/socket';

export default function ChatSidebar({ onSelect }) {
  const [online, setOnline] = useState([]);
  const [rooms, setRooms] = useState(['global']);
  const [currentRoom, setRoom] = useState('global');

  useEffect(() => {
    socket.on('onlineUsers', setOnline);
    socket.on('roomUsers', ({ room, users }) => {
      if (!rooms.includes(room)) setRooms(r => [...r, room]);
    });
    return () => {
      socket.off('onlineUsers');
      socket.off('roomUsers');
    };
  }, [rooms]);

  const handleRoomSelect = (r) => {
    setRoom(r);
    socket.emit('joinRoom', r);
    onSelect({ mode: 'room', target: r });
  };

  const handleUserSelect = (user) => {
    onSelect({ mode: 'private', target: user });
  };

  return (
    <aside style={{ width: '200px', padding: '1rem', borderRight: '1px solid #ddd' }}>
      <h3>Rooms</h3>
      <ul>
        {rooms.map(r => (
          <li key={r}>
            <button onClick={() => handleRoomSelect(r)}>
              {r}
            </button>
          </li>
        ))}
      </ul>
      <h3>Users</h3>
      <ul>
        {online.map(u => (
          <li key={u}>
            <button onClick={() => handleUserSelect(u)}>
              {u}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
