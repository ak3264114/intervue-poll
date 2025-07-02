const PollModel = require('../models/poll.model');
const AppError = require('../helpers/AppError');
const { sendResponse } = require('../helpers/sendResponse');

exports.createPoll = async (req, res, next) => {
  try {
    const { question, options, duration } = req.body;

    if (
      !question ||
      !Array.isArray(options) ||
      options.length < 2 ||
      typeof duration !== 'number' ||
      duration <= 0
    ) {
      throw new AppError('Invalid poll data', 400);
    }

    const poll = PollModel.createPoll({ question, options, duration });
    sendResponse(res, 201, 'Poll created successfully', poll);
  } catch (error) {
    next(error);
  }
};

exports.votePoll = async (req, res, next) => {
  try {
    const { pollId, studentName, optionIndex } = req.body;

    const updatedPoll = PollModel.vote(pollId, studentName, optionIndex);

    if (!updatedPoll)
      throw new AppError('Poll not found, already voted, or expired', 400);

    sendResponse(res, 200, 'Vote submitted', updatedPoll);
  } catch (error) {
    next(error);
  }
};



exports.getActivePoll = (req, res, next) => {
  try {
    const activePoll = PollModel.getActivePoll(); // assumes you have a getActive method in model

    if (!activePoll) {
      return res.status(200).json(null); // no active poll
    }

    res.status(200).json(activePoll);
  } catch (error) {
    next(new AppError('Failed to fetch active poll', 500));
  }
};



exports.getPollHistory = (req, res, next) => {
  try {
    const history = PollModel.getPastPolls();
    sendResponse(res, 200, 'Poll history fetched successfully', history);
  } catch (error) {
    next(new AppError('Failed to fetch poll history', 500));
  }
};