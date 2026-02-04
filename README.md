# 🎯 Visa Interview Bot

An AI-powered consular interview practice application that simulates realistic visa interview scenarios using advanced language models.

## 🌟 Features

- **Realistic Interview Simulation**: Ultra-realistic consular officer AI with direct, authoritative responses
- **Document Analysis**: Upload and analyze passport, financial proof, and supporting documents
- **Visa Decision System**: Comprehensive scoring and decision-making based on interview performance
- **Dual AI Support**: Choose between Groq (Llama 3.3 70B) or Google Gemini (2.5 Flash)
- **Professional Tone**: Simulates actual embassy interview conditions

## 🚀 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI Models**: Groq API (Llama 3.3 70B) / Google Gemini API
- **Deployment**: Ready for Pxxl App, Vercel, Render, Railway, etc.

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- API key from either:
  - Groq (https://console.groq.com/keys) - Recommended
  - Google Gemini (https://makersuite.google.com/app/apikey)

## 🔧 Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd visa-interview-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   PORT=8000
   NODE_ENV=development
   GROQ_API_KEY=your_groq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   
   This runs both backend (port 8000) and frontend (port 5173) concurrently.

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 🏗️ Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions for Pxxl App and other platforms.

**Quick Deploy to Pxxl:**
1. Push code to GitHub
2. Connect repository to Pxxl
3. Set environment variables
4. Deploy!

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and configuration.

### Chat Endpoint
```
POST /api/chat
```
Handles interview conversation with AI officer.

**Request Body:**
```json
{
  "message": "I want to apply for a tourist visa",
  "conversationHistory": [],
  "uploadedDocuments": {
    "passport": [],
    "financialProof": [],
    "supportingDocuments": []
  }
}
```

### Interview Analysis
```
POST /api/analyze-interview
```
Analyzes complete interview and returns visa decision.

**Request Body:**
```json
{
  "conversationHistory": [...],
  "uploadedDocuments": {...}
}
```

**Response:**
```json
{
  "decision": "GRANTED|DENIED|PENDING",
  "reason": "Complete documentation and satisfactory interview",
  "score": 85,
  "redFlags": [],
  "positives": ["Valid passport provided", "Clear purpose stated"],
  "recommendation": "Visa approved - collect passport in 3-5 business days"
}
```

## 🎮 How to Use

1. **Start Interview**: Open the app and begin conversation
2. **Upload Documents**: Upload passport (required), financial proof, supporting docs
3. **Answer Questions**: Respond to consular officer's direct questions
4. **Get Decision**: After interview, receive visa decision with detailed analysis

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 8000) | No |
| `NODE_ENV` | Environment (development/production) | Yes |
| `GROQ_API_KEY` | Groq API key for Llama 3.3 70B | Yes* |
| `GEMINI_API_KEY` | Google Gemini API key | Yes* |

*At least one API key is required

## 🛠️ Project Structure

```
visa-interview-bot/
├── src/                          # Frontend React code
│   ├── components/              # React components
│   ├── App.jsx                  # Main app component
│   └── index.css               # Tailwind styles
├── server.js                    # Express backend server
├── enhanced-document-analyzer.js # Document analysis logic
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── .env.example                # Environment variables template
└── DEPLOYMENT_GUIDE.md         # Deployment instructions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License

## 🆘 Support

For issues or questions:
- Check the [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- Open a GitHub issue
- Check server logs for debugging

## 🎯 Features in Detail

### Interview System
- Direct, authoritative consular officer persona
- Maximum 2-sentence responses (realistic time constraints)
- Handles unprofessional behavior, vague answers, delays
- Quick decision-making (10-15 exchanges typically)

### Document Verification
- Passport validation (mandatory)
- Financial proof analysis
- Supporting documents review
- Automatic scoring system

### Decision Logic
- Score-based evaluation (0-100)
- Red flag tracking
- Positive indicator recognition
- Comprehensive final decision with reasoning

---

**Made with ❤️ for visa applicants worldwide**