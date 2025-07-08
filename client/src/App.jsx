import { useEffect } from 'react';
import socket from './socket/socket';

function App() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <h1>Socket.IO Chat App</h1>
      <p>Check the console to see the socket connection log.</p>
    </div>
  );
}

export default App;

import { useState } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';

function App() {
  const [chatTarget, setChatTarget] = useState({ mode: 'global', target: 'global' });

  return (
    <div style={{ display: 'flex' }}>
      <ChatSidebar onSelect={setChatTarget} />
      <ChatWindow chatTarget={chatTarget} />
    </div>
  );
}
