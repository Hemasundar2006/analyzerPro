import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ExamAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('No file selected.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('https://analyzerpro-1.onrender.com/api/parse-exam', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error processing the file. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
            EXAM ANALYZER PRO
          </h1>
          <p className="text-slate-400 text-lg">Instant RRB Response Sheet Analysis & Performance Analytics</p>
        </header>

        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl"
        >
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-8 transition-colors hover:border-cyan-500/50 group">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="text-lg font-medium text-slate-200">
                {file ? file.name : "Click to upload RRB Response PDF"}
              </span>
              <span className="text-sm text-slate-500 mt-2">Only .pdf files are supported</span>
            </label>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all transform active:scale-95 ${
                !file || loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Analyze Exam'
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-center">
              {error}
            </div>
          )}
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center">
                  <span className="mr-2">📊</span> EXAM ANALYZER PRO: SCORECARD
                </h2>
                <div className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString()}</div>
              </div>

              {/* Section 1 & 2: Candidate Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Candidate Metadata</h3>
                  <div className="space-y-3">
                    <p className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-semibold">{result.metadata.fullName}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Roll Number</span>
                      <span className="font-semibold">{result.metadata.rollNumber}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Registration</span>
                      <span className="font-semibold">{result.metadata.registration}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Community</span>
                      <span className="font-semibold">{result.metadata.community}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Examination Context</h3>
                  <div className="space-y-3">
                    <p className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Subject</span>
                      <span className="font-semibold">{result.metadata.subject}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Test Centre</span>
                      <span className="font-semibold truncate max-w-[200px]">{result.metadata.testCentre}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Exam Date</span>
                      <span className="font-semibold">{result.metadata.examDate}</span>
                    </p>
                    <p className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Shift / Time</span>
                      <span className="font-semibold">{result.metadata.shiftTime}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Consolidated Score */}
              <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                    <h3 className="text-slate-400 font-medium mb-1">🧮 CONSOLIDATED RAW SCORE</h3>
                    <div className="text-7xl font-black text-white flex items-baseline">
                      {result.stats.finalScore}
                      <span className="text-2xl text-slate-500 ml-2">/ {result.stats.totalQuestions}</span>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <p className="text-slate-500 text-xs font-bold uppercase mb-1">Attempted</p>
                      <p className="text-2xl font-bold">{result.stats.attempted}</p>
                    </div>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <p className="text-green-500/80 text-xs font-bold uppercase mb-1">Correct (🟢)</p>
                      <p className="text-2xl font-bold text-green-400">{result.stats.correct}</p>
                    </div>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <p className="text-red-500/80 text-xs font-bold uppercase mb-1">Incorrect (🔴)</p>
                      <p className="text-2xl font-bold text-red-400">{result.stats.incorrect}</p>
                    </div>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <p className="text-slate-500 text-xs font-bold uppercase mb-1">Unattempted (⚪)</p>
                      <p className="text-2xl font-bold text-slate-300">{result.stats.unattempted}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Score Calculation */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-100 font-bold mb-4 flex items-center">
                  <span className="mr-2 text-cyan-500">⚙️</span> HOW YOUR SCORE WAS CALCULATED
                </h3>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="bg-slate-950/50 p-4 rounded-xl font-mono text-sm border border-slate-800/50">
                    <p className="text-cyan-400 mb-2">// Formula Applied</p>
                    <p className="text-slate-200">Score = (Correct × 1) - (Incorrect × 1/3)</p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Positive Marks</span>
                      <span className="text-green-400 font-bold">+{result.stats.positiveMarks}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Penalty Deduction</span>
                      <span className="text-red-400 font-bold">-{result.stats.penalty}</span>
                    </p>
                    <div className="h-px bg-slate-800 my-2"></div>
                    <p className="flex justify-between text-lg font-bold">
                      <span className="text-slate-200">Final Raw Score</span>
                      <span className="text-cyan-400 underline decoration-cyan-500/30 underline-offset-4">{result.stats.finalScore}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5: Analytics & Insights */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-12">
                <h3 className="text-slate-100 font-bold mb-6 flex items-center">
                  <span className="mr-2 text-cyan-500">📈</span> ANALYTICS INSIGHTS
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Internal Accuracy</p>
                    <div className="text-3xl font-black text-white">{result.stats.accuracy}%</div>
                    <p className="text-[10px] text-slate-500 mt-2 px-2">
                      ({result.stats.correct} correct out of {result.stats.attempted} attempted)
                    </p>
                  </div>
                  
                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Penalty Impact</p>
                    <div className="text-3xl font-black text-white">{result.stats.penaltyImpact}%</div>
                    <p className="text-[10px] text-slate-500 mt-2 px-2">
                      Losing ~{result.stats.penaltyImpact}% of marks to negative weightage
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Efficiency Rating</p>
                    <div className="text-3xl font-black text-cyan-400">
                      {result.stats.accuracy > 80 ? 'Elite' : result.stats.accuracy > 60 ? 'Optimal' : 'Growing'}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 px-2 uppercase tracking-widest">
                      Performance Grade
                    </p>
                  </div>
                </div>
                
                {result.stats.unattemptedList.length > 0 && (
                  <div className="mt-8 p-4 bg-slate-950/40 rounded-xl border border-slate-800/50">
                    <p className="text-slate-400 text-sm font-medium mb-3">Questions Left Unattempted (Sample):</p>
                    <div className="flex flex-wrap gap-2">
                      {result.stats.unattemptedList.map(q => (
                        <span key={q} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-md text-sm border border-slate-700">
                          Q.{q}
                        </span>
                      ))}
                      {result.stats.unattempted > 10 && (
                        <span className="px-3 py-1 text-slate-500 text-sm italic">+ {result.stats.unattempted - 10} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExamAnalyzer;
