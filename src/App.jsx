import React, { useState, useRef, useEffect } from 'react';
import FinalReport from './components/FinalReport';
import DocumentUpload from './components/DocumentUpload';
import VisaDecision from './components/VisaDecision';

// Time-based greeting utility
const getTimeBasedGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    return "Good morning";
  } else if (currentHour >= 12 && currentHour < 17) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

export default function App() {
  // Add new state for stages and documents
  const [stage, setStage] = useState('upload'); // 'upload', 'interview', 'ended'
  const [uploadedDocuments, setUploadedDocuments] = useState(null);
  const [userName, setUserName] = useState('');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [interviewReport, setInterviewReport] = useState(null);
  const [visaStatus, setVisaStatus] = useState(null);
  const [decisionData, setDecisionData] = useState(null);
  const [showDecision, setShowDecision] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const transcriptContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const shouldRestartRef = useRef(true);

  // ✅ FIX: Refs to avoid stale closures in SpeechRecognition callbacks
  const isConnectedRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const interviewEndedRef = useRef(false);

  // ✅ FIX: Keep refs in sync with state
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { interviewEndedRef.current = interviewEnded; }, [interviewEnded]);

  const scrollToBottom = () => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load and log available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('📢 Available voices:', voices.map(v => `${v.name} (${v.lang})`));
        const femaleVoices = voices.filter(v => 
          v.name.toLowerCase().includes('female') ||
          v.name.includes('Samantha') ||
          v.name.includes('Zira') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen')
        );
        console.log('👩 Female voices available:', femaleVoices.map(v => v.name));
      }
    };

    loadVoices();
    
    // Voices might load asynchronously in some browsers
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Check if bot response contains decision/final report
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.content.toLowerCase();
        
        if (
          content.includes('[decision]') || 
          content.includes('**approved**') || 
          content.includes('**denied**') ||
          content.includes('**requires additional documentation**') ||
          content.includes('interview score') ||
          content.includes('visa approved') ||
          content.includes('visa denied') ||
          content.includes('visa is approved') ||
          content.includes('visa is denied') ||
          content.includes('application approved') ||
          content.includes('application denied') ||
          content.includes('application is denied') ||
          content.includes('congratulations') ||
          content.includes('unfortunately') ||
          content.includes('pending')
        ) {
          setInterviewEnded(true);
          setStage('ended');
          parseInterviewReport(lastMessage.content);
        }
      }
    }
  }, [messages]);

  const parseInterviewReport = (content) => {
    const report = {
      decision: 'PENDING',
      score: 0,
      redFlags: [],
      strengths: [],
      missingDocs: [],
      rawContent: content
    };

    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('approved') || 
        lowerContent.includes('congratulations') ||
        lowerContent.includes('visa is granted') ||
        lowerContent.includes('application is successful')) {
      report.decision = 'APPROVED';
      setVisaStatus('APPROVED');
    } 
    else if (lowerContent.includes('denied') || 
             lowerContent.includes('unfortunately') ||
             lowerContent.includes('cannot approve') ||
             lowerContent.includes('rejected')) {
      report.decision = 'DENIED';
      setVisaStatus('DENIED');
    } 
    else if (lowerContent.includes('requires additional') ||
             lowerContent.includes('pending') ||
             lowerContent.includes('need more') ||
             lowerContent.includes('submit additional')) {
      report.decision = 'PENDING';
      setVisaStatus('PENDING');
    }

    const scoreMatch = content.match(/(\d+)\/100/);
    if (scoreMatch) report.score = parseInt(scoreMatch[1]);

    setInterviewReport(report);
  };

  // ✅ FIX: SpeechRecognition runs once with empty deps, uses refs instead of state
  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error("Speech Recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-NG';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcriptPart + ' ';
        } else {
          interim += transcriptPart;
        }
      }

      setCurrentTranscript(final + interim);
      setFinalTranscript(prev => prev + final);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition ERROR:', event.error);
      if (event.error === 'no-speech') {
        console.log('No speech detected, continuing...');
      } else if (event.error === 'aborted') {
        console.log('Recognition aborted');
      } else {
        console.error('Recognition error:', event.error);
        setIsListening(false);
      }
    };

    // ✅ FIX: onend now reads from refs — always gets the latest values
    recognition.onend = () => {
      setIsListening(false);

      if (shouldRestartRef.current && isConnectedRef.current && !isSpeakingRef.current && !interviewEndedRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
          } catch (err) {
            console.error('Restart failed:', err);
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // ✅ FIX: Empty dependency array — created once, never torn down mid-session

  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.error('Play error:', err);
      });
    }
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;
      setIsCameraOn(true);
      
    } catch (err) {
      console.error("Camera/mic error:", err);
      
      let errorMessage = "Could not access camera/microphone.\n\n";
      if (err.name === 'NotAllowedError') {
        errorMessage += "Please allow camera and microphone permissions in your browser settings.";
      } else if (err.name === 'NotFoundError') {
        errorMessage += "No camera or microphone found on your device.";
      } else if (err.name === 'NotReadableError') {
        errorMessage += "Camera is being used by another application.";
      } else {
        errorMessage += err.message;
      }
      
      alert(errorMessage);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // UPDATED: Improved female voice selection
  const speak = (text) => {
    return new Promise((resolve) => {
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;  // Slightly higher pitch for more feminine sound
      utterance.volume = 1;

      // Get available voices
      const voices = synthRef.current.getVoices();
      
      // Try multiple strategies to find a female voice
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female')
      ) || voices.find(v => 
        v.name.includes('Samantha') ||  // macOS
        v.name.includes('Zira') ||       // Windows
        v.name.includes('Victoria') ||   // Windows
        v.name.includes('Karen') ||      // macOS
        v.name.includes('Google UK English Female') ||
        v.name.includes('Google US English Female')
      ) || voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Woman') || v.name.includes('girl'))
      );
      
      // Set the voice if found
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('✅ Using female voice:', femaleVoice.name);
      } else {
        // Fallback: use first English voice and adjust pitch higher
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.pitch = 1.3; // Higher pitch to sound more feminine
          console.log('⚠️ No female voice found, using:', englishVoice.name, 'with higher pitch');
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  };

  const handleDocumentsUploaded = (docs) => {
    setUploadedDocuments(docs);
    setStage('interview');
  };

  const handleAdditionalDocumentsUploaded = (docs) => {
    setUploadedDocuments(prev => ({ ...prev, ...docs }));
    setShowDocumentUpload(false);
    
    const notificationMsg = {
      role: 'user',
      content: 'I have uploaded the requested documents.'
    };
    setMessages(prev => [...prev, notificationMsg]);
    setConversationHistory(prev => [...prev, notificationMsg]);
    
    setTimeout(startListening, 800);
  };

  const handleStartCall = async () => {
    console.log('🚀 Starting interview...');
    setIsConnected(true);
    setShowRetryButton(false);
    setInterviewEnded(false);
    setInterviewReport(null);
    setVisaStatus(null);
    setShowDecision(false);
    setDecisionData(null);
    shouldRestartRef.current = true;

    await startCamera();
    setIsMicOn(true);

    const timeGreeting = getTimeBasedGreeting();
    const greeting = {
      role: 'assistant',
      content: `${timeGreeting}. Please have a seat. I'm the consular officer who will be conducting your visa interview today. Before we begin, which country are you applying to visit, and what type of visa are you applying for?`
    };

    setMessages([greeting]);
    setConversationHistory([greeting]);

    await speak(greeting.content);
    
    setTimeout(startListening, 800);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    shouldRestartRef.current = false;
    stopCamera();
    setIsMicOn(false);
    stopListening();
    synthRef.current.cancel();
    setShowRetryButton(false);
  };

  // Handle End Interview button click
  const handleEndInterview = async () => {
    console.log('📋 Analyzing interview...');
    
    // Stop all active processes
    handleDisconnect();
    setInterviewEnded(true);
    
    try {
      // ✅ UPDATED: Use relative path for production
      const response = await fetch('/api/analyze-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: conversationHistory,
          uploadedDocuments: uploadedDocuments
        })
      });

      if (!response.ok) throw new Error('Failed to analyze interview');

      const decision = await response.json();
      console.log('✅ Decision received:', decision);
      
      setDecisionData(decision);
      setShowDecision(true);
      setVisaStatus(decision.decision === 'GRANTED' ? 'APPROVED' : decision.decision);
      
    } catch (error) {
      console.error('❌ Analysis error:', error);
      alert('Failed to analyze interview. Please try again.');
    }
  };

  const handleRestartInterview = () => {
    setMessages([]);
    setConversationHistory([]);
    setInterviewEnded(false);
    setInterviewReport(null);
    setVisaStatus(null);
    setShowDecision(false);
    setDecisionData(null);
    setStage('upload');
    handleDisconnect();
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking && !interviewEnded) {
      shouldRestartRef.current = true;
      setShowRetryButton(false);
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setFinalTranscript('');
      } catch (err) {
        console.error('Start listening failed:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      shouldRestartRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);

      const toSend = (finalTranscript || currentTranscript).trim();

      if (!toSend || toSend.length < 3) {
        setCurrentTranscript('');
        setFinalTranscript('');
        if (!interviewEnded) {
          setTimeout(startListening, 800);
        }
        return;
      }

      sendVoiceMessage(toSend);
      setCurrentTranscript('');
      setFinalTranscript('');
    }
  };

  const sendVoiceMessage = async (transcript) => {
    const cleaned = transcript.trim();
    if (!cleaned || isLoading) return;

    const userMessage = { role: 'user', content: cleaned };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const newHistory = [...conversationHistory, userMessage];
    setConversationHistory(newHistory);

    try {
      // ✅ UPDATED: Use relative path for production
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: cleaned,
          conversationHistory: conversationHistory,
          uploadedDocuments: uploadedDocuments
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      if (!data?.response) throw new Error('Invalid server response');

      const botResponse = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, botResponse]);
      setConversationHistory(prev => [...prev, botResponse]);

      await speak(botResponse.content);
      
      if (!interviewEnded) {
        setTimeout(startListening, 800);
      }

    } catch (error) {
      console.error("API error:", error);
      const errorMsg = {
        role: 'assistant',
        content: "I'm having trouble hearing you clearly. Please click 'Try Again' and speak a bit louder and slower."
      };
      setMessages(prev => [...prev, errorMsg]);
      await speak(errorMsg.content);
      
      setShowRetryButton(true);
    } finally {
      setIsLoading(false);
    }
  };

  const exportTranscript = () => {
    const transcript = messages.map((m) => {
      const timestamp = new Date().toLocaleTimeString();
      return `[${timestamp}] ${m.role === 'user' ? 'Applicant' : 'Consular Officer'}: ${m.content}`;
    }).join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visa-interview-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDecisionColor = () => {
    if (!visaStatus) return 'bg-slate-700';
    if (visaStatus === 'APPROVED') return 'bg-green-600';
    if (visaStatus === 'DENIED') return 'bg-red-600';
    return 'bg-yellow-600';
  };

  const getDecisionEmoji = () => {
    if (!visaStatus) return '⏳';
    if (visaStatus === 'APPROVED') return '✅';
    if (visaStatus === 'DENIED') return '❌';
    return '⚠️';
  };

  // Render document upload stage
  if (stage === 'upload') {
    return <DocumentUpload onComplete={handleDocumentsUploaded} />;
  }

  // Render visa decision display
  if (showDecision && decisionData) {
    return <VisaDecision decision={decisionData} onRestart={handleRestartInterview} />;
  }

  // Render main interview interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-6">
        <h1 className="text-3xl font-bold text-center">Visa Mock Interview</h1>
        <div className="flex justify-center mt-4 gap-4 flex-wrap">
          <div className={`px-6 py-2 rounded-full flex items-center gap-2 ${isConnected ? 'bg-green-600' : 'bg-yellow-600'}`}>
            <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
            <span className="font-semibold">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {isListening && (
            <div className="px-6 py-2 rounded-full flex items-center gap-2 bg-red-600">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
              <span className="font-semibold">Listening...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="px-6 py-2 rounded-full flex items-center gap-2 bg-blue-600">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse"></div>
              <span className="font-semibold">Bot Speaking...</span>
            </div>
          )}
          {visaStatus && (
            <div className={`px-6 py-2 rounded-full flex items-center gap-2 ${getDecisionColor()}`}>
              <span className="text-xl">{getDecisionEmoji()}</span>
              <span className="font-semibold">{visaStatus}</span>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {visaStatus && (
          <div className="max-w-4xl mx-auto mb-8 animate-slideIn">
            <div className={`relative rounded-3xl overflow-hidden shadow-2xl border-4 ${
              visaStatus === 'APPROVED' ? 'border-green-500 bg-green-600' :
              visaStatus === 'DENIED' ? 'border-red-500 bg-red-600' :
              'border-yellow-500 bg-yellow-600'
            }`}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative p-12 text-center">
                <div className="mb-6">
                  <span className="text-9xl">{getDecisionEmoji()}</span>
                </div>
                
                <h2 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
                  VISA {visaStatus}
                </h2>
                
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  {visaStatus === 'APPROVED' && 
                    "Congratulations! Your visa application has been approved. Please check below for next steps."}
                  {visaStatus === 'DENIED' && 
                    "Your visa application has been denied. Please review the reasons provided by the consular officer."}
                  {visaStatus === 'PENDING' && 
                    "Your visa application is pending. Additional documentation is required to complete the process."}
                </p>
                
                {interviewReport?.score > 0 && (
                  <div className="mt-6 inline-block bg-white/20 backdrop-blur-sm rounded-full px-8 py-3">
                    <p className="text-2xl font-bold text-white">
                      Interview Score: {interviewReport.score}/100
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/30 rounded-2xl p-6 border-2 border-blue-500/30">
            <h2 className="text-xl font-semibold mb-4 text-center">You</h2>
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-blue-500">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ 
                  transform: 'scaleX(-1)',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: isCameraOn ? 'block' : 'none'
                }}
              />
              {!isCameraOn && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-slate-400">Camera Off</p>
                  </div>
                </div>
              )}
              {isListening && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">🎤 Listening... Speak clearly</p>
                      {currentTranscript && (
                        <p className="text-xs mt-1">{currentTranscript}</p>
                      )}
                    </div>
                    <button 
                      onClick={stopListening}
                      className="bg-white text-red-600 px-3 py-1 rounded-md text-sm font-bold hover:bg-gray-100"
                    >
                      STOP
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-6 border-2 border-pink-500/30">
            <h2 className="text-xl font-semibold mb-4 text-center">Consular Officer</h2>
            <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border-2 border-pink-500 flex items-center justify-center">
              <img 
                src="/female-consular.jpg"
                alt="Consular Officer"
                className={`transition-all duration-300 ${
                  isSpeaking ? 'brightness-110 scale-105' : 'brightness-100'
                }`}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: imageLoaded ? 'block' : 'none',
                  width: '100%',
                  height: '100%'
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                  <p className="text-sm text-slate-400">Loading officer...</p>
                </div>
              )}
              {isSpeaking && imageLoaded && (
                <div className="absolute bottom-4 left-4 right-4 bg-blue-600/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-white rounded animate-pulse"></div>
                      <div className="w-1 h-6 bg-white rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-5 bg-white rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-4 bg-white rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    </div>
                    <p className="text-sm font-semibold">Speaking...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {!isConnected ? (
            <button
              onClick={handleStartCall}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Voice Interview
            </button>
          ) : (
            <>
              <button
                onClick={() => isCameraOn ? stopCamera() : startCamera()}
                className={`p-4 rounded-full transition-all transform hover:scale-110 shadow-lg ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'}`}
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {isCameraOn ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
              </button>

              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isSpeaking || interviewEnded}
                className={`p-4 rounded-full transition-all transform hover:scale-110 shadow-lg ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                title={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setShowDocumentUpload(true)}
                disabled={interviewEnded}
                className="p-4 rounded-full transition-all transform hover:scale-110 shadow-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                title="Upload additional documents"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>

              {showRetryButton && (
                <button
                  onClick={startListening}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-all transform hover:scale-105 animate-pulse shadow-lg"
                >
                  Try Again
                </button>
              )}

              {interviewEnded && (
                <button
                  onClick={handleRestartInterview}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  New Interview
                </button>
              )}

              <button
                onClick={handleEndInterview}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                End Interview
              </button>
            </>
          )}
        </div>

        {showDocumentUpload && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Upload Additional Documents</h3>
                <button
                  onClick={() => setShowDocumentUpload(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <DocumentUpload 
                onComplete={handleAdditionalDocumentsUploaded}
                isAdditionalUpload={true}
              />
            </div>
          </div>
        )}

        {isConnected && !interviewEnded && (
          <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Interview Transcript</h3>
              <button
                onClick={exportTranscript}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
            
            <div 
              ref={transcriptContainerRef}
              className="h-96 overflow-y-auto mb-4 space-y-4 p-4 bg-slate-900/50 rounded-xl scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {msg.role === 'user' ? 'You' : 'Consular Officer'}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-white px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Messages</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Your Responses</p>
                <p className="text-2xl font-bold">{messages.filter(m => m.role === 'user').length}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Questions Asked</p>
                <p className="text-2xl font-bold">{messages.filter(m => m.role === 'assistant').length}</p>
              </div>
            </div>
          </div>
        )}

        {interviewEnded && interviewReport && (
          <FinalReport 
            report={interviewReport}
            onRestart={handleRestartInterview}
            onExport={exportTranscript}
          />
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}