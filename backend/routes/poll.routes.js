const express = require('express');
const router = express.Router();
const PollController = require('../controllers/poll.controller');

router.post('/create', PollController.createPoll);
router.post('/vote', PollController.votePoll);
router.get('/active', PollController.getActivePoll);
router.get('/history', PollController.getPollHistory);

module.exports = router;
