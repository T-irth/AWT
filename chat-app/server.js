const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join', (username) => {
    socket.username = username;
    socket.broadcast.emit('user joined', username);
  });

  socket.on('chat message', (msg) => {
    if (socket.username) {
      io.emit('chat message', {
        username: socket.username,
        message: msg,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      socket.broadcast.emit('user left', socket.username);
    }
    console.log('User disconnected');
  });
});

http.listen(3000, () => {
  console.log('Server running → http://localhost:3000');
});