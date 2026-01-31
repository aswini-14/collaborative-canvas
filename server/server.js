const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const RoomManager = require('./rooms');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const rooms = new RoomManager();
const ROOM_ID = 'default-room';

io.on('connection', (socket) => {
  const user = {
    id: socket.id,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
  };

  socket.join(ROOM_ID);
  rooms.addUser(ROOM_ID, socket.id, user);

  const room = rooms.getRoom(ROOM_ID);

  socket.emit('init_state', room.state.getState());
  io.to(ROOM_ID).emit('users_update', Array.from(room.users.values()));

  socket.on('draw_stroke', (stroke) => {
    room.state.addStroke(stroke);
    socket.to(ROOM_ID).emit('draw_stroke', stroke);
  });

  socket.on('draw_segment', (data) => {
    socket.to(ROOM_ID).emit('draw_segment', data);
  });


  socket.on('undo', () => {
    const removed = room.state.undo();
    if (removed) io.to(ROOM_ID).emit('undo', removed);
  });

  socket.on('redo', () => {
    const restored = room.state.redo();
    if (restored) io.to(ROOM_ID).emit('redo', restored);
  });

  socket.on('cursor_move', (data) => {
    socket.to(ROOM_ID).emit('cursor_move', {
      userId: socket.id,
      ...data,
      color: user.color,
    });
  });

  socket.on('disconnect', () => {
    rooms.removeUser(ROOM_ID, socket.id);
    io.to(ROOM_ID).emit('user_left', socket.id);
    io.to(ROOM_ID).emit(
      'users_update',
      Array.from(room.users.values())
    );
  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});