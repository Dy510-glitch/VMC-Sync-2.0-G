/* ==========================================================================
   VMC SYNC - BACKEND SERVER ENGINE (Node.js + Express + Socket.io)
   ========================================================================== */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let activeCallsCount = 0;
let totalMessagesToday = 0;

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Room Join
  socket.on('join_room', (data) => {
    socket.join(data.room);
    io.emit('admin_audit_event', { type: 'ROOM_JOIN', details: `${data.user} joined ${data.room}` });
  });

  // Real-Time Group Chat Message
  socket.on('send_group_message', (data) => {
    totalMessagesToday++;
    io.to(data.room).emit('receive_group_message', data);

    // Relay to Admin Monitoring Log
    io.emit('admin_audit_event', { 
      type: 'CHAT_MSG', 
      details: `[${data.room}] ${data.sender}: ${data.text}` 
    });
  });

  // WebRTC Video Signaling
  socket.on('video_call_offer', (data) => {
    activeCallsCount++;
    socket.to(data.target).emit('incoming_video_call', data);
    io.emit('admin_audit_event', { type: 'CALL_START', details: `Call initiated by ${data.caller}` });
  });

  socket.on('ice_candidate', (data) => {
    socket.to(data.target).emit('ice_candidate', data.candidate);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('VMC SYNC Real-Time Server running on port 3000');
});
