class PollModel {
  static polls = [];

  static createPoll({ question, options, duration }) {
    const now = Date.now();
    const newPoll = {
      id: now,
      question,
      options: options.map(({ text, isCorrect }) => ({
        text,
        isCorrect: !!isCorrect,
        count: 0,
      })),
      responses: {},
      startTime: now,
      endTime: now + duration * 1000,
    };
    this.polls.push(newPoll);
    return newPoll;
  }


  static vote(studentName, selectedOptionText) {
    const poll = this.getActivePoll();
    const now = Date.now();

    if (!poll) return null;

    // Check poll active window
    if (now < poll.startTime || now > poll.endTime) return null;

    // Prevent double voting
    if (poll.responses[studentName]) return null;

    // Find the index of the option by matching text
    const optionIndex = poll.options.findIndex(option => option.text === selectedOptionText);
    if (optionIndex === -1) return null;

    // Record vote
    poll.responses[studentName] = optionIndex;
    poll.options[optionIndex].count += 1;

    return poll;
  }


  static getPoll(pollId) {
    return this.polls.find(p => p.id === pollId);
  }

  static getAllPolls() {
    return this.polls;
  }

  static getActivePoll() {
    const now = Date.now();
    return this.polls.find(poll => now >= poll.startTime && now <= poll.endTime);
  }

  static getPastPolls() {
    const now = Date.now();
    return this.polls.filter(poll => poll.endTime < now);
  }
}

module.exports = PollModel;
