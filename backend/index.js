const express = require('express');
const http = require('http');
const cors = require('cors'); // ✅ Import cors
const socketHandler = require('./socket');
const pollRoutes = require('./routes/poll.routes');
const AppError = require('./helpers/AppError');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: false 
}));


app.use(morgan('combined'));

app.use(express.json());
app.use('/api/polls', pollRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message });
});


socketHandler(server);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
