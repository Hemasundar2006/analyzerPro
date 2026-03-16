const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const pdf = require('pdf-parse');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Result = require('./models/Result');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/examAnalyzer';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Helper to transform common cloud links to direct download links
const transformLink = (url) => {
  if (!url) return url;
  
  // Google Drive
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/\/d\/([^\/]+)/)?.[1] || url.match(/id=([^\&]+)/)?.[1];
    if (fileId) return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  
  // Dropbox
  if (url.includes('dropbox.com')) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('?dl=1', '');
  }
  
  return url;
};

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

app.post('/api/analyze', upload.single('pdfFile'), async (req, res) => {
  const { pdfUrl, url } = req.body;
  const targetUrl = pdfUrl || url;
  
  try {
    let dataBuffer;
    let sourceLink = targetUrl || 'Uploaded File';

    if (req.file) {
      // Handle File Upload
      dataBuffer = req.file.buffer;
    } else if (targetUrl) {
      // Handle URL
      if (targetUrl.startsWith('file://')) {
        return res.status(400).json({ 
          error: 'Local file links (file://) cannot be accessed directly by the server. Please upload the PDF file instead.' 
        });
      }

      const directUrl = transformLink(targetUrl);

      const response = await axios.get(directUrl, { 
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      dataBuffer = Buffer.from(response.data);
    } else {
      return res.status(400).json({ error: 'Either a PDF URL or an uploaded file is required' });
    }

    // Extract Text
    const pdfData = await pdf(dataBuffer);
    const rawText = pdfData.text;

    // Process extraction and calculation logic
    const analysisResult = extractData(rawText);
    
    // Create new Result document
    const result = new Result({
      ...analysisResult,
      pdfUrl: sourceLink,
      url: sourceLink
    });

    await result.save();

    res.json(result);
  } catch (error) {
    console.error('Error analyzing PDF:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF. Ensure the file is valid and accessible.',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
