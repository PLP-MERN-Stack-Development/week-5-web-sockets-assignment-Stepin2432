import { useEffect, useState } from 'react';
import socket from '../socket/socket';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('User' + Math.floor(Math.random() * 1000));
  const [typingUser, setTypingUser] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.emit('registerUser', username);

    socket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('userTyping', (name) => {
      setTypingUser(name);
    });

    socket.on('userStoppedTyping', () => {
      setTypingUser('');
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('onlineUsers');
    };
  }, [username]);

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('sendMessage', { username, message });
      socket.emit('stopTyping');
      setMessage('');
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value) {
      socket.emit('typing', username);
    } else {
      socket.emit('stopTyping');
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2>Global Chat</h2>

      <div>
        <strong>Online Users ({onlineUsers.length}):</strong>
        <ul>
          {onlineUsers.map((user, i) => (
            <li key={i}>{user}</li>
          ))}
        </ul>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '1rem', height: '300px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.username}</strong>: {msg.message}
            <div style={{ fontSize: '0.75rem', color: '#888' }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {typingUser && (
          <div style={{ fontStyle: 'italic', color: '#888' }}>{typingUser} is typing...</div>
        )}
      </div>

      <form onSubmit={handleSend} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Send</button>
      </form>
    </div>
  );
}

type ChatTarget =
  | { mode: 'global' | 'room'; target: string }
  | { mode: 'private'; target: string };
