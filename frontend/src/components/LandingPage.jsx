import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>

      <div className="container mx-auto px-6 py-20 relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="px-4 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 text-sm font-semibold mb-6 inline-block">
            Beta Version 1.0
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
            Analyze Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Government Exam</span> <br /> 
            Response Sheet Instantly
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Fast, accurate, and detailed score breakdown for RRB, SSC, and other government recruitment exams. 
            Get your official-style scorecard in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/analyzer')}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105 active:scale-95 text-lg"
            >
              Get Started Now
            </button>
            <button className="px-8 py-4 bg-transparent border border-gray-700 hover:border-gray-500 text-white font-bold rounded-xl transition-all text-lg">
              View Sample Report
            </button>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-5xl">
          {[
            { title: "Instant Analysis", desc: "No more manual checking. Paste your URL and see results.", icon: "⚡" },
            { title: "Precise Calculation", desc: "Official marking schemes applied automatically.", icon: "🎯" },
            { title: "Downloadable Sheet", desc: "Save your result as a high-quality scorecard image.", icon: "📄" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all text-left"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
