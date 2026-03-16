import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AnalyzerPage from './components/AnalyzerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyzer" element={<AnalyzerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
