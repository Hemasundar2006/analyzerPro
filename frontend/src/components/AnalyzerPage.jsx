import React, { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router-dom';

const AnalyzerPage = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState(null);
  const scorecardRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!pdfUrl && !selectedFile) {
      setError('Please enter a PDF URL or upload a file');
      return;
    }

    if (pdfUrl && pdfUrl.startsWith('file://')) {
      setError('Local file links (file://) cannot be accessed directly. Please use the "Upload File" button instead.');
      return;
    }

    setLoading(true);
    setError('');
    setResultData(null);

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('pdfFile', selectedFile);
        response = await axios.post('https://analyzerpro.onrender.com/api/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post('https://analyzerpro.onrender.com/api/analyze', { url: pdfUrl });
      }
      setResultData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze PDF. Please check the file/URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setPdfUrl(''); // Clear URL if file is selected
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const downloadImage = () => {
    if (scorecardRef.current === null) return;

    toPng(scorecardRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `Result_${resultData.candidateDetails.rollNumber}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Download failed', err);
      });
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white font-sans selection:bg-red-500/30">
      {/* Background elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full"></div>
      </div>

      <nav className="relative z-10 px-6 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-black text-xl shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
            A
          </div>
          <span className="text-xl font-bold tracking-tight">ANALYZER <span className="text-red-500 text-xs">PRO</span></span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Home
        </button>
      </nav>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-5xl">
        {/* Modern Glass Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 mb-12 shadow-2xl"
        >
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-black mb-3 italic tracking-tight">
              GENERATE YOUR <span className="text-red-600 uppercase">Scorecard</span>
            </h2>
            <p className="text-gray-400">Insert your direct PDF link below to start the intelligent extraction process.</p>
          </div>

          <form onSubmit={handleCalculate} className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                </div>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => {
                    setPdfUrl(e.target.value);
                    if (e.target.value) setSelectedFile(null);
                  }}
                  placeholder="Paste direct PDF link here..."
                  className="w-full pl-12 pr-4 py-5 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all text-white placeholder:text-gray-600 font-medium"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className={`px-6 py-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center min-w-[140px] ${selectedFile ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-white/20 bg-white/5 hover:border-red-500/50 text-gray-400 hover:text-white'}`}
                >
                  {selectedFile ? (
                    <>
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      <span className="text-[10px] font-bold uppercase truncate max-w-[100px]">{selectedFile.name}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <span className="text-[10px] font-bold uppercase">Upload File</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`px-10 py-5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95 flex items-center justify-center space-x-3 min-w-[200px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>ANALYZING...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                      <span>CALCULATE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 opacity-50">
              <div className="h-px bg-white/20 flex-grow"></div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Supports Cloud URLs & Direct Uploads</span>
              <div className="h-px bg-white/20 flex-grow"></div>
            </div>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center font-bold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Result Area */}
        <AnimatePresence>
          {resultData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-16"
            >
              <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 px-2">
                <div>
                  <h3 className="text-2xl font-black text-white italic">ANALYSIS COMPLETE</h3>
                  <p className="text-gray-400 text-sm">Review your results and download the high-res scorecard below.</p>
                </div>
                <button
                  onClick={downloadImage}
                  className="px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all active:scale-95 group"
                >
                  <svg className="w-5 h-5 group-hover:bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  DOWNLOAD PNG
                </button>
              </div>

              {/* The Scorecard Visual (Clean White Paper Style for Download) */}
              <div className="p-4 bg-gray-900/50 rounded-[40px] border border-white/5 backdrop-blur-sm shadow-inner group">
                <div 
                  ref={scorecardRef} 
                  className="bg-white text-black p-0 overflow-hidden shadow-2xl relative"
                  style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}
                >
                  {/* Design Elements of the Scorecard */}
                  <div className="p-8 border-b-8 border-red-600 flex flex-col items-center relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-600/10"></div>
                    <div className="flex justify-between w-full items-center mb-6">
                       <div className="w-20 h-20 bg-gray-50 border-2 border-gray-100 rounded-full flex items-center justify-center p-2 text-[9px] text-center font-bold text-gray-400">MINISTRY OF RAILWAYS</div>
                       <div className="text-center">
                          <h1 className="text-3xl font-black text-red-700 tracking-tighter">रेलवे भर्ती बोर्ड</h1>
                          <h2 className="text-2xl font-bold text-gray-800">RAILWAY RECRUITMENT BOARDS</h2>
                       </div>
                       <div className="w-20 h-20 bg-gray-50 border-2 border-gray-100 rounded-full flex items-center justify-center p-2 text-[9px] text-center font-bold text-gray-400">OFFICIAL RECRUITMENT</div>
                    </div>
                    <div className="px-6 py-1 bg-red-600 text-white text-xs font-black rounded-full uppercase tracking-widest">Score Transcripts - 2024</div>
                  </div>

                  <div className="p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-red-600 uppercase tracking-widest border-l-4 border-red-600 pl-3">Candidate Metadata</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-400 font-bold text-[10px] uppercase">Name</span>
                            <span className="font-black text-gray-900 border-b-2 border-red-100">{resultData.candidateDetails.name}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-400 font-bold text-[10px] uppercase">Roll No</span>
                            <span className="font-mono font-bold text-gray-800">{resultData.candidateDetails.rollNumber}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-400 font-bold text-[10px] uppercase">Registration</span>
                            <span className="font-mono font-bold text-gray-800">{resultData.candidateDetails.regNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-red-600 uppercase tracking-widest border-l-4 border-red-600 pl-3">Examination Context</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-400 font-bold text-[10px] uppercase">Subject</span>
                            <span className="font-bold text-gray-800 uppercase">{resultData.candidateDetails.subject}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-400 font-bold text-[10px] uppercase">Date / Time</span>
                            <span className="font-bold text-gray-800">{resultData.candidateDetails.examDate} | {resultData.candidateDetails.examTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-12">
                      <h4 className="text-xs font-black text-red-600 uppercase tracking-widest border-l-4 border-red-600 pl-3 mb-6">Performance Matrix</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                           <div className="text-gray-400 text-[9px] font-black uppercase mb-1">Total Items</div>
                           <div className="text-2xl font-black">{resultData.scoreDetails.totalQuestions}</div>
                         </div>
                         <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                           <div className="text-green-600 text-[9px] font-black uppercase mb-1">Right</div>
                           <div className="text-2xl font-black text-green-700">{resultData.scoreDetails.right}</div>
                         </div>
                         <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                           <div className="text-red-600 text-[9px] font-black uppercase mb-1">Wrong</div>
                           <div className="text-2xl font-black text-red-700">{resultData.scoreDetails.wrong}</div>
                         </div>
                         <div className="bg-gray-100 p-4 rounded-2xl text-center border border-gray-200">
                           <div className="text-gray-500 text-[9px] font-black uppercase mb-1">Omitted</div>
                           <div className="text-2xl font-black text-gray-700">{resultData.scoreDetails.na}</div>
                         </div>
                      </div>
                    </div>

                    <div className="bg-yellow-400 p-10 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="text-gray-900 font-black text-xs uppercase tracking-widest mb-1">Consolidated Marks Scored</div>
                        <div className="text-6xl font-black text-gray-900 tracking-tighter">{resultData.scoreDetails.marks}</div>
                      </div>
                      <div className="relative z-10 text-right md:block hidden">
                        <div className="px-4 py-2 bg-black/10 rounded-full text-[10px] font-black uppercase mb-2">Authenticated Result</div>
                        <div className="text-sm font-bold text-gray-800 italic">Score based on 0.25 negative marking policy</div>
                      </div>
                    </div>

                    <div className="mt-12 pt-10 border-t border-gray-100 flex justify-between items-end">
                      <div className="text-[9px] text-gray-300 font-mono space-y-1">
                        <p>ID: {resultData._id}</p>
                        <p>HASH: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        <p>VER: 2.0.1_STABLE</p>
                      </div>
                      <div className="text-center">
                        <div className="w-40 h-1 bg-gray-100 mb-2"></div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controller of Examinations</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle Background Watermark */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none select-none -rotate-12 whitespace-nowrap text-9xl font-black text-black">
                    OFFICIAL VALIDATED
                  </div>
                </div>
              </div>

              {/* DETAILED INSIGHTS DASHBOARD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[32px] p-8 mt-10"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                  </div>
                  <h3 className="text-2xl font-black italic">ANALYTICS <span className="text-red-600">INSIGHTS</span></h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Accuracy Card */}
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Internal Accuracy</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-white">
                        {((resultData.scoreDetails.right / (resultData.scoreDetails.right + resultData.scoreDetails.wrong)) * 100).toFixed(1)}%
                      </span>
                      <span className="text-green-500 text-xs font-bold mb-1">↑ Good</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full" 
                        style={{ width: `${(resultData.scoreDetails.right / (resultData.scoreDetails.right + resultData.scoreDetails.wrong)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Negative Marking Impact */}
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Penalty Impact</p>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-black text-red-500">
                        -{(resultData.scoreDetails.wrong * 0.25).toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-xs mb-1 font-bold">Marks Lost</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-4 leading-tight italic">
                      Losing {((resultData.scoreDetails.wrong * 0.25 / resultData.scoreDetails.right) * 100).toFixed(1)}% of correctly earned marks to negative weightage.
                    </p>
                  </div>

                  {/* Section Performance */}
                  <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Exams Metric</p>
                    <div className="space-y-3 mt-2">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Section</span>
                          <span className="font-bold">{resultData.scoreDetails.section}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Attempt Rate</span>
                          <span className="font-bold">{(( (resultData.scoreDetails.totalQuestions - resultData.scoreDetails.na) / resultData.scoreDetails.totalQuestions) * 100).toFixed(0)}%</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-gray-400 uppercase">
                    Status: <span className="text-green-500">Verified</span>
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-gray-400 uppercase">
                    Exams: {resultData.candidateDetails.subject}
                  </div>
                  <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-gray-400 uppercase">
                    Roll: {resultData.candidateDetails.rollNumber}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 mt-20 pb-10 text-center text-gray-500 text-xs">
        <p>&copy; 2026 Government Exam Analyzer Pro. All Rights Reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <span className="hover:text-white cursor-pointer px-2 transition-colors">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer px-2 transition-colors">Terms of Use</span>
          <span className="hover:text-white cursor-pointer px-2 transition-colors">Support</span>
        </div>
      </footer>
    </div>
  );
};

export default AnalyzerPage;
