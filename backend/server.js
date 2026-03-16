const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const pdf = require('pdf-parse');
const Result = require('./models/Result');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/examAnalyzer';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Helper function to extract details using Regex (Placeholders)
const extractData = (text) => {
  // These are placeholder regex patterns. In a real scenario, these would be tuned to the specific PDF format.
  const regNumber = text.match(/Registration Number\s*:\s*(\w+)/i)?.[1] || "N/A";
  const rollNumber = text.match(/Roll Number\s*:\s*(\w+)/i)?.[1] || "N/A";
  const name = text.match(/Candidate Name\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || "N/A";
  const community = text.match(/Community\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || "N/A";
  const testCentre = text.match(/Test Center Name\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || "N/A";
  const examDate = text.match(/Test Date\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || "N/A";
  const examTime = text.match(/Test Time\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || "N/A";
  const subject = text.match(/Subject\s*:\s*([^\n\r]+)/i)?.[1]?.trim() || "N/A";

  // Simulate looping through 100 questions
  // In reality, you'd parse Question ID and Status from the text
  let right = 0;
  let wrong = 0;
  let na = 0;

  // Mocking the question parsing logic
  // Typically, you'd find patterns like "Status : Answered" or "Chosen Option : 1"
  for (let i = 1; i <= 100; i++) {
    const random = Math.random();
    if (random > 0.4) right++;
    else if (random > 0.1) wrong++;
    else na++;
  }

  const marks = (right * 1) - (wrong * 0.25);
  const totalQuestions = right + wrong + na;

  return {
    candidateDetails: {
      regNumber,
      rollNumber,
      name,
      community,
      testCentre,
      examDate,
      examTime,
      subject,
    },
    scoreDetails: {
      section: "All Sections",
      totalQuestions,
      na,
      right, wrong,
      marks: parseFloat(marks.toFixed(2))
    }
  };
};

app.post('/api/analyze', async (req, res) => {
  const { pdfUrl } = req.body;

  if (!pdfUrl) {
    return res.status(400).json({ error: 'PDF URL is required' });
  }

  try {
    // Download PDF
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const dataBuffer = Buffer.from(response.data);

    // Extract Text
    const pdfData = await pdf(dataBuffer);
    const rawText = pdfData.text;

    // Process extraction and calculation logic
    const analysisResult = extractData(rawText);
    
    // Create new Result document
    const result = new Result({
      ...analysisResult,
      pdfUrl
    });

    await result.save();

    res.json(result);
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    res.status(500).json({ error: 'Failed to process PDF. Ensure the URL is valid and accessible.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
