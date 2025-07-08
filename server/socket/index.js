const users = require('../models/userModel');         // Map<socketId, username>
const userSockets = require('../models/socketModel'); // Map<username, socketId>

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // 1️⃣ Register user
    socket.on('registerUser', (username) => {
      users.set(socket.id, username);
      userSockets.set(username, socket.id);
      io.emit('onlineUsers', Array.from(users.values()));
    });

    // 2️⃣ Global / Room messaging
    socket.on('sendMessage', ({ username, message, room }) => {
      const data = { username, message, timestamp: new Date().toISOString() };
      if (room && room !== 'global') {
        io.to(room).emit('receiveMessage', data);
      } else {
        io.emit('receiveMessage', data);
      }
    });

    // 3️⃣ Join / Leave room
    socket.on('joinRoom', (room) => {
      socket.join(room);
      // (optional) broadcast room’s user list
      const roomUsers = Array.from(io.sockets.adapter.rooms.get(room) || [])
        .map(id => users.get(id));
      io.to(room).emit('roomUsers', { room, users: roomUsers });
    });
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
    });

    // 4️⃣ Private messaging
    socket.on('privateMessage', ({ from, to, message }) => {
      const targetId = userSockets.get(to);
      if (targetId) {
        const data = { from, message, timestamp: new Date().toISOString() };
        io.to(targetId).emit('receivePrivateMessage', data);
      }
    });

    // 5️⃣ Typing indicator (global / room / private)
    socket.on('typing', ({ username, room, isPrivate, to }) => {
      const payload = { username, room, to };
      if (isPrivate) {
        const targetId = userSockets.get(to);
        socket.to(targetId).emit('userTyping', payload);
      } else if (room && room !== 'global') {
        socket.to(room).emit('userTyping', payload);
      } else {
        socket.broadcast.emit('userTyping', payload);
      }
    });
    socket.on('stopTyping', ({ room, isPrivate, to }) => {
      if (isPrivate) {
        const targetId = userSockets.get(to);
        socket.to(targetId).emit('userStoppedTyping');
      } else if (room && room !== 'global') {
        socket.to(room).emit('userStoppedTyping');
      } else {
        socket.broadcast.emit('userStoppedTyping');
      }
    });

    // 6️⃣ File/image sharing
    socket.on('sendFile', ({ username, fileName, fileData, room, to }) => {
      const payload = { username, fileName, fileData, timestamp: new Date().toISOString() };
      if (to) {
        const targetId = userSockets.get(to);
        io.to(targetId).emit('receiveFile', payload);
      } else if (room && room !== 'global') {
        io.to(room).emit('receiveFile', payload);
      } else {
        io.emit('receiveFile', payload);
      }
    });

    // 7️⃣ Disconnect
    socket.on('disconnect', () => {
      const username = users.get(socket.id);
      users.delete(socket.id);
      userSockets.delete(username);
      io.emit('onlineUsers', Array.from(users.values()));
      console.log('User disconnected:', socket.id);
    });
  });
};
