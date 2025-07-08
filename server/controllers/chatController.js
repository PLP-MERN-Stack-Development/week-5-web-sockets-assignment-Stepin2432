// Placeholder: Will handle chat events
const sendMessage = (socket, data) => {
  socket.broadcast.emit('receiveMessage', data);
};

module.exports = { sendMessage };
