const express = require('express');
const { generateDocumentContext } = require('./enhanced-document-analyzer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Switch between APIs easily
const USE_GROQ = true;

// API Keys - REPLACE THESE WITH YOUR ACTUAL KEYS
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ||'';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const SYSTEM_PROMPT = `You are a professional consular officer conducting a visa interview at an embassy. You must be DIRECT, EFFICIENT, and AUTHORITATIVE like a real officer.

CRITICAL BEHAVIOR RULES:
- Keep ALL responses under 2 sentences maximum (real officers are time-constrained)
- Ask ONE question at a time, never multiple questions
- Be formal and direct - no apologies, no "please take your time", no over-explaining
- Real interviews last 3-5 minutes (aim for 10-15 exchanges total)
- Make quick decisions - don't give endless second chances
- Use commands, not requests: "Show me your bank statement" NOT "I'd like to see..."
- Never say "I understand", "I appreciate", "thank you for sharing", or similar soft phrases
- This is an OFFICIAL interview, not a friendly conversation

HANDLING UNPROFESSIONAL BEHAVIOR:
If the applicant is:
- Eating, distracted, or multitasking → "This interview requires your full attention. Are you ready to proceed?"
- Being rude or aggressive → "I need you to remain respectful. Do you wish to continue this interview?"
- Taking too long to respond → "I need an answer now. [Repeat question once, then move to next topic or denial]"
- Joking or not taking it seriously → "This is a formal visa interview. I need direct answers to my questions."
- Asking you personal questions → "I'm here to assess your visa eligibility. Let's continue with the interview."
- Trying to negotiate or argue → "The decision is mine to make. Answer the question."
- Rambling or going off-topic → "That's not relevant. [Repeat specific question]"

IF APPLICANT SAYS THEY NEED TO LEAVE/PAUSE:
- "This interview must be completed now. If you leave, your application will be denied."
- Do NOT say "take your time" or "we can wait"

IF APPLICANT ASKS INAPPROPRIATE QUESTIONS:
Examples: "How are you?", "What's your name?", "Do you like your job?"
Response: "Let's focus on your application. [Ask next visa question]"

IF APPLICANT TRIES TO TELL STORIES OR OVERSHARE:
- "I need specific facts, not stories. [Ask direct question]"
- "Answer the question directly."

INTERVIEW PROTOCOL:
1. FIRST question: "What country are you traveling to and what type of visa are you applying for?"
2. Follow up based on their answer:
   - Purpose of travel (be specific - why exactly?)
   - Duration of stay (exact dates if possible)
   - Accommodation (specific address or hotel name)
   - Financial proof (exact amounts)
   - Employment status (company name, position, salary)
   - Ties to home country (family, property, job security)

WHEN ANSWERS ARE VAGUE OR INCOMPLETE:
First time: "Be specific. [What exactly do you mean?]"
Second time: "I need clear information. [Repeat question directly]"
Third time: Move toward denial or ask for documentation

Examples:
- Applicant: "I work in tech" → You: "What company and what position?"
- Applicant: "I have some savings" → You: "How much exactly?"
- Applicant: "I'll stay with a friend" → You: "What's their full name and address?"
- Applicant: "I'll figure it out when I get there" → You: "That's not acceptable. Do you have a plan or not?"

RED FLAGS (Track Internally, Act on Them):
🚩 Vague employment - no company name, no job title, no salary mentioned
🚩 Unclear funds - "I have money" without amounts
🚩 No accommodation plan - "I'll book something" is not a plan
🚩 Inconsistent answers - saying different things about same topic
🚩 Plans don't match visa type - tourist visa but meeting clients
🚩 Weak ties to home country - no job, no family, no property
🚩 Evasive responses - avoiding direct answers repeatedly
🚩 Overly nervous or aggressive behavior
🚩 Unprofessional conduct - eating, joking, being disrespectful

WHEN YOU SPOT RED FLAGS:
- First red flag: Probe directly - "That concerns me. Explain."
- Second red flag: "I need documentation to verify this."
- Third red flag or no documentation: Move to denial

DOCUMENT VERIFICATION (Be Direct and Commanding):
- "Show me your employment letter."
- "I need to see bank statements now."
- "Do you have a sponsorship letter?"
- "Upload your documents now."
- If they say "I'll get it later" → "Without it, I cannot approve your application."

DECISION TIMING:
Make your decision after:
- 10-12 meaningful exchanges, OR
- 2-3 major red flags with no documentation, OR  
- Answers remain vague after asking twice, OR
- Applicant is unprofessional or uncooperative

DO NOT drag the interview beyond 15 exchanges unless genuinely needed.

APPROVAL (Keep it Brief and Professional):
"Your visa is approved. Collect your passport in 3-5 business days."
(Nothing more - no congratulations, no "I'm pleased to inform you")

DENIAL (Be Direct and Final):
"Your application is denied. [One brief reason]. Good day."

Examples:
- "Your application is denied. Insufficient financial documentation. Good day."
- "Your application is denied. I'm not convinced you'll return to your home country. Good day."
- "Your application is denied. Your employment status is unclear. Good day."
- "Your application is denied. Your answers were inconsistent. Good day."

DO NOT:
- Explain extensively why they were denied
- Give them tips on reapplying (unless they specifically ask)
- Apologize for the denial
- Engage in debate about the decision

PENDING DOCUMENTATION:
"Your application is on hold. Submit [specific document] within 5 business days."
"Your case requires administrative processing. You'll be contacted within 2-4 weeks."

TONE EXAMPLES - STUDY THESE:

❌ WRONG (Too friendly): "I apologize if that seemed final. I'm willing to reconsider if you have more information."
✅ CORRECT (Professional): "I've made my decision. Unless you have documentation now, we're done."

❌ WRONG (Too wordy): "I'd like to take a look at your bank statement. Please go ahead and hand it over to me whenever you're ready."
✅ CORRECT (Direct): "Show me your bank statement."

❌ WRONG (Too soft): "Could you maybe tell me approximately how much money you might have available?"
✅ CORRECT (Commanding): "How much is in your account?"

❌ WRONG (Too accommodating): "I'll wait for you to finish eating. Take your time."
✅ CORRECT (Professional): "This interview requires your full attention. Are you ready?"

❌ WRONG (Too chatty): "Good morning! How are you today? I hope you're doing well!"
✅ CORRECT (Business-like): "What country are you traveling to and what type of visa?"

NEVER DO THESE:
❌ Give interview scores or percentages during conversation
❌ List "strengths and weaknesses" out loud
❌ Say "congratulations" multiple times
❌ Be overly patient with vague answers (maximum 2 attempts)
❌ Explain your decision-making process in detail
❌ Use phrases like "I understand your situation" or "I appreciate you sharing"
❌ Allow the applicant to control the interview flow
❌ Answer personal questions about yourself
❌ Accommodate unreasonable requests (breaks, delays, "come back later")

REMEMBER: You are the authority figure. You control the interview. You make the final decision. Be professional, efficient, and decisive. Real consular officers see 50+ applicants per day - they don't have time for lengthy conversations or debates.

FINAL DECISION FORMAT (After Interview Concludes):
When you make your final decision, use this format:

[DECISION]: **[APPROVED / DENIED / PENDING]**

[If APPROVED]: 
"Your visa is approved. Collect your passport in 3-5 business days."

[If DENIED]:
"Your application is denied. [One brief reason]. Good day."

[If PENDING]:
"Your application is on hold. Submit [specific documents] within 5 business days."

That's it. Keep it brief. Move on to the next applicant.`;

// Groq API call
async function callGroqAPI(messages) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.6,
      max_tokens: 120,
      top_p: 0.85,
      frequency_penalty: 0.3,
      presence_penalty: 0.2,
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Groq API Error:', JSON.stringify(errorData, null, 2));
    throw new Error(`Groq API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Gemini API call
async function callGeminiAPI(geminiContents) {
  let retries = 0;
  let response;
  
  while (retries < 3) {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            temperature: 0.6,
            topK: 30,
            topP: 0.85,
            maxOutputTokens: 120,
          }
        })
      }
    );
    
    if (response.status === 503) {
      retries++;
      console.log(`⚠️ Server overloaded, retry ${retries}/3...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
    
    break;
  }

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Gemini API Error:', JSON.stringify(errorData, null, 2));
    
    if (response.status === 429) {
      throw new Error('API quota exceeded. Please try again tomorrow.');
    }
    
    throw new Error('Gemini API failed');
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response structure');
  }

  return data.candidates[0].content.parts[0].text.trim();
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory, uploadedDocuments } = req.body;

    console.log('\n=== NEW REQUEST ===');
    console.log('Message received:', message);
    console.log('History length:', conversationHistory?.length || 0);
    console.log('Using:', USE_GROQ ? 'Groq' : 'Gemini');

    const documentContext = generateDocumentContext(uploadedDocuments);
    console.log('📄 Document Analysis:');
    console.log(documentContext);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let botResponse;

    if (USE_GROQ) {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT + documentContext }
      ];

      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      }

      messages.push({ role: 'user', content: message });

      console.log('Calling Groq API...');
      botResponse = await callGroqAPI(messages);

    } else {
      let geminiContents = [];

      geminiContents.push({
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + documentContext }]
      });
      geminiContents.push({
        role: 'model',
        parts: [{ text: 'Understood. I am a consular officer. I will be direct, efficient, and authoritative.' }]
      });

      if (conversationHistory && conversationHistory.length > 0) {
        for (const msg of conversationHistory) {
          geminiContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      geminiContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      console.log('Calling Gemini API...');
      botResponse = await callGeminiAPI(geminiContents);
    }
    
    console.log('✅ Bot response:', botResponse);
    console.log('=== END REQUEST ===\n');

    res.json({ response: botResponse });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    console.error('❌ Stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to get response',
      message: error.message
    });
  }
});

// ========== NEW ENDPOINT FOR VISA DECISION ==========
app.post('/api/analyze-interview', async (req, res) => {
  try {
    const { conversationHistory, uploadedDocuments } = req.body;

    console.log('\n=== ANALYZING INTERVIEW FOR DECISION ===');
    console.log('Total messages:', conversationHistory?.length || 0);
    console.log('Documents:', uploadedDocuments);

    const decision = analyzeInterviewDecision(conversationHistory, uploadedDocuments);
    
    console.log('📋 Final Decision:', decision.decision);
    console.log('📊 Score:', decision.score);
    console.log('=== END ANALYSIS ===\n');

    res.json(decision);

  } catch (error) {
    console.error('❌ Analysis Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze interview',
      message: error.message
    });
  }
});

// ========== DECISION ANALYSIS FUNCTION ==========
function analyzeInterviewDecision(history, documents) {
  let score = 100;
  const reasons = [];
  const redFlags = [];
  const positives = [];

  // ========== DOCUMENT CHECKS ==========
  
  // CRITICAL: Missing Passport = Automatic Denial
  if (!documents.passport || documents.passport.length === 0) {
    return {
      decision: 'DENIED',
      reason: 'Missing passport - automatic grounds for denial',
      score: 0,
      redFlags: ['No passport uploaded - mandatory requirement'],
      positives: [],
      recommendation: 'Application cannot proceed without valid passport'
    };
  } else {
    positives.push('Valid passport provided');
  }

  // Missing Financial Proof
  if (!documents.financialProof || documents.financialProof.length === 0) {
    score -= 35;
    redFlags.push('Missing financial proof/bank statement');
  } else {
    positives.push('Financial documentation provided');
  }

  // Missing Supporting Documents
  if (!documents.supportingDocuments || documents.supportingDocuments.length === 0) {
    score -= 15;
    redFlags.push('Missing supporting documents (employment letter, invitation, etc.)');
  } else {
    positives.push('Supporting documents provided');
  }

  // ========== CONVERSATION ANALYSIS ==========
  
  if (!history || history.length === 0) {
    return {
      decision: 'DENIED',
      reason: 'No interview conducted',
      score: 0,
      redFlags: ['Interview not completed'],
      positives: []
    };
  }

  // Check if bot explicitly denied in conversation
  const lastBotMessage = history[history.length - 1]?.content || '';
  const botMessages = history.filter(msg => msg.role === 'assistant').map(msg => msg.content);
  
  // Look for explicit denial in ANY bot message
  const denialPhrases = [
    'application is denied',
    'visa is denied', 
    'denied.',
    'cannot approve',
    'your application has been denied'
  ];
  
  const approvalPhrases = [
    'visa is approved',
    'application is approved',
    'approved.',
    'collect your passport'
  ];

  const hasDenial = botMessages.some(msg => 
    denialPhrases.some(phrase => msg.toLowerCase().includes(phrase))
  );

  const hasApproval = botMessages.some(msg => 
    approvalPhrases.some(phrase => msg.toLowerCase().includes(phrase))
  );

  // If bot explicitly approved
  if (hasApproval) {
    return {
      decision: 'GRANTED',
      reason: 'Application approved by consular officer',
      score: Math.max(score, 75),
      redFlags: redFlags.length > 0 ? redFlags : [],
      positives: [...positives, 'Approved by officer', 'Satisfactory interview responses'],
      recommendation: 'Visa granted - collect passport in 3-5 business days'
    };
  }

  // If bot explicitly denied
  if (hasDenial) {
    let denialReason = 'Insufficient cooperation and incomplete information';
    
    if (lastBotMessage.toLowerCase().includes('financial')) {
      denialReason = 'Insufficient financial documentation';
    } else if (lastBotMessage.toLowerCase().includes('cooperation') || lastBotMessage.toLowerCase().includes('answers')) {
      denialReason = 'Insufficient cooperation and lack of direct answers';
    } else if (lastBotMessage.toLowerCase().includes('employment')) {
      denialReason = 'Unclear employment status';
    } else if (lastBotMessage.toLowerCase().includes('return') || lastBotMessage.toLowerCase().includes('home country')) {
      denialReason = 'Weak ties to home country';
    }

    return {
      decision: 'DENIED',
      reason: denialReason,
      score: Math.min(score, 35),
      redFlags: [...redFlags, 'Officer determined application unsatisfactory'],
      positives: positives,
      recommendation: 'Application denied - reapply with complete documentation'
    };
  }

  // Analyze user responses quality
  const userMessages = history.filter(msg => msg.role === 'user').map(msg => msg.content);
  
  // Count vague/evasive answers
  const vagueIndicators = ['maybe', 'i think', 'probably', 'not sure', 'i guess', 'kind of', 'sort of'];
  let vagueCount = 0;
  
  userMessages.forEach(msg => {
    const lowerMsg = msg.toLowerCase();
    if (vagueIndicators.some(indicator => lowerMsg.includes(indicator)) || msg.trim().length < 15) {
      vagueCount++;
    }
  });

  if (vagueCount > 3) {
    score -= 20;
    redFlags.push(`Multiple vague or incomplete answers (${vagueCount} instances)`);
  }

  // Check for specific visa information mentioned
  const mentionedCountry = userMessages.some(msg => 
    msg.toLowerCase().includes('korea') || 
    msg.toLowerCase().includes('japan') || 
    msg.toLowerCase().includes('usa') ||
    msg.toLowerCase().includes('uk') ||
    msg.toLowerCase().includes('canada')
  );

  if (mentionedCountry) {
    positives.push('Clear destination country specified');
  } else {
    score -= 10;
    redFlags.push('Destination country unclear');
  }

  // Check for purpose of visit
  const purposeKeywords = ['study', 'work', 'tourist', 'business', 'visit', 'university', 'job', 'conference'];
  const mentionedPurpose = userMessages.some(msg => 
    purposeKeywords.some(keyword => msg.toLowerCase().includes(keyword))
  );

  if (mentionedPurpose) {
    positives.push('Purpose of visit stated');
  } else {
    score -= 10;
    redFlags.push('Purpose of visit unclear');
  }

  // Interview length check (too short = suspicious)
  if (userMessages.length < 3) {
    score -= 15;
    redFlags.push('Interview too brief - insufficient information gathered');
  }

  // ========== FINAL DECISION LOGIC ==========

  if (score >= 70 && redFlags.length <= 1) {
    return {
      decision: 'GRANTED',
      reason: 'Complete documentation and satisfactory interview responses',
      score: score,
      redFlags: redFlags,
      positives: positives,
      recommendation: 'Visa approved - collect passport in 3-5 business days'
    };
  } 
  else if (score >= 45 && score < 70) {
    return {
      decision: 'PENDING',
      reason: 'Additional administrative processing required',
      score: score,
      redFlags: redFlags,
      positives: positives,
      recommendation: 'Submit missing documents within 5 business days',
      nextSteps: redFlags.map(flag => {
        if (flag.includes('financial')) return 'Submit bank statements or financial proof';
        if (flag.includes('supporting')) return 'Submit employment letter or supporting documents';
        if (flag.includes('vague')) return 'Prepare clearer, more specific answers for follow-up';
        return 'Provide additional documentation as requested';
      })
    };
  } 
  else {
    return {
      decision: 'DENIED',
      reason: 'Incomplete documentation and/or unsatisfactory interview',
      score: score,
      redFlags: redFlags,
      positives: positives,
      recommendation: 'Reapply with complete documentation and preparation'
    };
  }
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    usingGroq: USE_GROQ,
    apiConfigured: true
  });
});

const PORT = process.env.PORT || 8000;

// Serve static files from React build (PRODUCTION ONLY)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoint: /api/chat`);
  console.log(`📋 Decision endpoint: /api/analyze-interview`);
  console.log(`❤️  Health check: /api/health`);
  console.log(`🤖 Using: ${USE_GROQ ? 'Groq (Llama 3.3 70B)' : 'Gemini (2.5 Flash)'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ ULTRA-REALISTIC consular officer system loaded');
  console.log('⚡ Direct, efficient, authoritative - handles ALL client behaviors');
  console.log('🎯 Maximum 2 sentences, commanding tone, quick decisions');
  console.log('🛡️ Handles: vague answers, unprofessional behavior, delays, arguments');
  console.log('📄 Document verification system ACTIVE');
  console.log('⚖️  Visa decision analysis system ACTIVE');
});