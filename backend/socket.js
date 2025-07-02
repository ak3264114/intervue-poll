const { Server } = require('socket.io');
const PollModel = require('./models/poll.model');

const connectedStudents = {};

module.exports = function (server) {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    // Register student
    socket.on('register-student', ({ name }) => {
      console.log(`👨‍🎓 Student registered: ${name} (Socket ID: ${socket.id})`);
      connectedStudents[socket.id] = { name };
      io.emit('student-list', Object.values(connectedStudents));
    });

    // Handle vote
    socket.on('vote', ({ studentName, selectedOption }) => {
      console.log("🗳️ Vote received from student:", studentName, "for option:", selectedOption)
      const updatedPoll = PollModel.vote(studentName, selectedOption);
      if (updatedPoll) {
        const totalVotes = updatedPoll.options.reduce((sum, o) => sum + o.count, 0);
        const result = {
          ...updatedPoll,
          options: updatedPoll.options.map((option, index) => ({
            id: String(index),
            text: option.text,
            count: option.count,
            isCorrect: option.isCorrect,
            percentage: totalVotes ? Math.round((option.count / totalVotes) * 100) : 0,
          })),
        };
        io.emit('poll-updated', result);
      }
    });

    // Handle poll creation from teacher
    socket.on('poll-created', (pollData) => {
      console.log('📢 Poll created by teacher:', pollData);

      // 1. End existing active poll if present
      const activePoll = PollModel.getActivePoll?.();
      if (activePoll && !activePoll.ended && activePoll.endTime > Date.now()) {
        PollModel.endPoll?.(activePoll.id, Date.now());
        console.log(`⏹️ Active poll (${activePoll.id}) ended at ${new Date().toISOString()}`);
      }

      // 2. Start the new poll
      io.emit('poll-started', pollData);
      io.emit('student-list', Object.values(connectedStudents));
    });

    // Handle chat message
    socket.on('chat-message', ({ name, message }) => {
      if (!name || !message) return;
      console.log(`💬 Chat message from ${name}: ${message}`);
      io.emit('chat-broadcast', {
        name,
        message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('get-student-list', () => {
      console.log(`📥 Student list requested by ${socket.id}`);
      socket.emit('student-list', Object.values(connectedStudents));
    });

    // Handle teacher kicking a student
    socket.on('kick-student', ({ name }) => {
      const targetSocketId = Object.keys(connectedStudents).find(
        (id) => connectedStudents[id].name === name
      );

      if (targetSocketId) {
        console.log(`🦶 Kicking student: ${name} (Socket ID: ${targetSocketId})`);
        io.to(targetSocketId).emit('kicked');
        delete connectedStudents[targetSocketId];
        io.emit('student-list', Object.values(connectedStudents));
      } else {
        console.warn(`⚠️ Student not found for kick: ${name}`);
      }
    });

    // On disconnect
    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
      delete connectedStudents[socket.id];
      io.emit('student-list', Object.values(connectedStudents));
    });
  });
};
