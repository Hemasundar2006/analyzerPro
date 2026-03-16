const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  candidateDetails: {
    regNumber: String,
    rollNumber: String,
    name: String,
    community: String,
    testCentre: String,
    examDate: String,
    examTime: String,
    subject: String,
  },
  scoreDetails: {
    section: String,
    totalQuestions: Number,
    na: Number,
    right: Number,
    wrong: Number,
    marks: Number,
  },
  pdfUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Result', ResultSchema);
