import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AnalyzerPage from './components/AnalyzerPage';
import ExamAnalyzer from './components/ExamAnalyzer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyzer-new" element={<AnalyzerPage />} />
        <Route path="/analyzer" element={<ExamAnalyzer />} />
      </Routes>
    </Router>
  );
}

export default App;
