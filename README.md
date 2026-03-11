# AI Resume Analyzer

An AI-powered web application that analyzes resumes against job descriptions, calculates ATS match scores, and provides actionable suggestions to improve your resume.

## 🚀 Features

- **Resume Upload**: Support for PDF and DOCX formats
- **ATS Score Calculation**: Get an instant match score against any job description
- **Skill Gap Analysis**: See which skills you have and which ones are missing
- **AI-Powered Suggestions**: Get recommendations to improve your bullet points

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion (animations)
- Recharts (visualizations)
- React Dropzone (file upload)
- Lucide React (icons)

### Backend
- Node.js + Express
- Multer (file handling)
- MongoDB (optional)

### AI Service
- Python + FastAPI
- spaCy (NLP)
- scikit-learn (ML)
- PyMuPDF (PDF parsing)

## 📁 Project Structure

```
ai-resume-analyzer/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   └── App.jsx     # Main app component
│   └── package.json
│
├── backend/            # Node.js API server
│   ├── routes/         # API routes
│   ├── server.js       # Express server
│   └── package.json
│
└── ai-service/         # Python AI/NLP service
    ├── resume_parser/  # Resume parsing module
    ├── job_matcher/    # Job description matching
    ├── scoring_engine/ # ATS scoring logic
    ├── main.py         # FastAPI server
    └── requirements.txt
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd ai-resume-analyzer
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

4. **Setup AI Service**
   ```bash
   cd ai-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

### Running the Application

1. **Start the AI Service** (Terminal 1)
   ```bash
   cd ai-service
   source venv/bin/activate
   python main.py
   ```
   AI service runs on http://localhost:8000

2. **Start the Backend** (Terminal 2)
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:5000

3. **Start the Frontend** (Terminal 3)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on http://localhost:5173

## 📝 API Endpoints

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze-resume` | Analyze resume against job description |
| POST | `/api/upload-resume` | Upload a resume file |
| GET | `/api/health` | Health check |

### AI Service API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Full resume analysis |
| POST | `/parse-resume` | Parse resume only |
| POST | `/parse-job` | Parse job description only |
| GET | `/health` | Health check |

## 🎨 UI Components

- **Navbar**: Sticky navigation with responsive mobile menu
- **Hero**: Landing page hero section with CTA
- **Features**: Feature cards showcasing capabilities
- **HowItWorks**: Step-by-step process visualization
- **FileUpload**: Drag-and-drop resume upload
- **ScoreCircle**: Animated ATS score display
- **SkillsDisplay**: Matched/missing skills visualization
- **SuggestionsPanel**: AI-generated improvement suggestions

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-analyzer
AI_SERVICE_URL=http://localhost:8000
```

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist folder to Vercel
```

### Backend (Render)
- Create a new Web Service
- Connect your GitHub repository
- Set build command: `npm install`
- Set start command: `npm start`

### AI Service (Render/Railway)
- Use Docker for containerized deployment
- Or deploy as a Python service

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
