import React from 'react';

export default function FinalReport({ report, onRestart, onExport }) {
  const getDecisionColor = () => {
    if (report.decision === 'APPROVED') return 'from-green-600 to-green-800';
    if (report.decision === 'DENIED') return 'from-red-600 to-red-800';
    return 'from-yellow-600 to-yellow-800';
  };

  const getDecisionIcon = () => {
    if (report.decision === 'APPROVED') return '✅';
    if (report.decision === 'DENIED') return '❌';
    return '⚠️';
  };

  const getScoreColor = () => {
    if (report.score >= 70) return 'text-green-400';
    if (report.score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBarColor = () => {
    if (report.score >= 70) return 'bg-green-500';
    if (report.score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDecisionMessage = () => {
    if (report.decision === 'APPROVED') {
      return 'Congratulations! Your visa application has been approved. You demonstrated strong ties to your home country and clear plans.';
    }
    if (report.decision === 'DENIED') {
      return 'Your visa application has been denied. Please review the feedback below and address the concerns before reapplying.';
    }
    return 'Your application requires additional documentation. Please submit the requested documents to proceed.';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Decision Banner */}
      <div className={`bg-gradient-to-r ${getDecisionColor()} rounded-2xl p-8 mb-8 text-center shadow-2xl border-2 ${
        report.decision === 'APPROVED' ? 'border-green-400' : 
        report.decision === 'DENIED' ? 'border-red-400' : 'border-yellow-400'
      }`}>
        <div className="text-7xl mb-4 animate-bounce">{getDecisionIcon()}</div>
        <h1 className="text-5xl font-bold mb-3">VISA {report.decision}</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          {getDecisionMessage()}
        </p>
      </div>

      {/* Score Display */}
      <div className="bg-slate-800/50 rounded-2xl p-8 mb-6 border border-slate-700">
        <div className="text-center mb-6">
          <p className="text-slate-400 mb-3 text-lg">Interview Performance Score</p>
          <div className={`text-7xl font-bold ${getScoreColor()} mb-4`}>
            {report.score}<span className="text-4xl">/100</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-6 overflow-hidden">
            <div 
              className={`h-6 rounded-full transition-all duration-1000 ease-out ${getScoreBarColor()}`}
              style={{ width: `${report.score}%` }}
            />
          </div>

          {/* Score Interpretation */}
          <p className="mt-4 text-slate-300">
            {report.score >= 70 && '🎉 Excellent performance! Strong application.'}
            {report.score >= 50 && report.score < 70 && '👍 Good effort, but some areas need improvement.'}
            {report.score < 50 && '⚠️ Significant concerns were identified. Please address them.'}
          </p>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-slate-800/50 rounded-2xl p-8 mb-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold">Detailed Assessment</h3>
        </div>
        
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed text-slate-200 bg-slate-900/50 rounded-xl p-6">
            {report.rawContent}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={onRestart}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Start New Interview
        </button>
        
        <button
          onClick={onExport}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Report
        </button>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Tips for Improvement
        </h4>
        <ul className="space-y-3 text-slate-300">
          {report.decision === 'DENIED' && (
            <>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Gather all required documentation before reapplying (bank statements, employment letters, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Practice answering questions clearly and confidently</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Demonstrate strong ties to your home country (job, family, property)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Be specific about your travel plans and intentions</span>
              </li>
            </>
          )}
          {report.decision === 'APPROVED' && (
            <>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Keep practicing to maintain your interview skills</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Always bring original documents to your actual interview</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Arrive early and dress professionally for the real interview</span>
              </li>
            </>
          )}
          {report.decision === 'PENDING' && (
            <>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span>Submit all requested documents promptly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span>Ensure all documents are recent and properly certified</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span>Follow up with the consulate if you don't hear back within the expected timeframe</span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Add CSS for fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}