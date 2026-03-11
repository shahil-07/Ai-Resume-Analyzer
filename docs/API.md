# API Documentation

## Backend API (Node.js - Port 5000)

Base URL: `http://localhost:5000`

### Endpoints

#### Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

#### Analyze Resume
```
POST /api/analyze-resume
```
Analyzes a resume against a job description and returns ATS score, skill analysis, and suggestions.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `resume` (file): PDF or DOCX file (max 5MB)
  - `jobDescription` (string): The job description text

**Response:**
```json
{
  "score": 75,
  "matched_skills": ["Python", "React", "Node.js"],
  "missing_skills": ["Kubernetes", "AWS"],
  "skill_score": 70,
  "text_score": 80,
  "keyword_score": 75,
  "experience_score": 80,
  "skill_gap_summary": "Good skill match (70%). Consider adding 2 missing skills.",
  "suggestions": [
    {
      "original": "Worked on web applications",
      "suggestion": "Developed web applications [Add: quantifiable impact]",
      "issues": ["weak_verb:worked on", "no_metrics"]
    }
  ]
}
```

**Error Responses:**
- `400`: Missing file or job description
- `413`: File too large (max 5MB)
- `415`: Unsupported file type
- `429`: Rate limit exceeded
- `500`: Server error

---

#### Upload Resume
```
POST /api/upload-resume
```
Uploads a resume file for later processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `resume` (file): PDF or DOCX file (max 5MB)

**Response:**
```json
{
  "message": "File uploaded successfully",
  "filename": "1234567890-resume.pdf",
  "size": 102400
}
```

---

## AI Service API (Python/FastAPI - Port 8000)

Base URL: `http://localhost:8000`

### Endpoints

#### Root
```
GET /
```
**Response:**
```json
{
  "name": "AI Resume Analyzer Service",
  "version": "1.0.0",
  "endpoints": ["/analyze", "/parse-resume", "/parse-job"]
}
```

---

#### Full Analysis
```
POST /analyze
```
Performs complete resume analysis including parsing, scoring, and suggestions.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `resume` (file): PDF or DOCX file
  - `job_description` (string): Job description text

**Response:**
```json
{
  "score": 75,
  "matched_skills": ["Python", "JavaScript"],
  "missing_skills": ["Docker"],
  "skill_score": 70,
  "text_score": 80,
  "keyword_score": 75,
  "experience_score": 80,
  "skill_categories": {
    "matched_required": ["Python"],
    "matched_preferred": ["JavaScript"],
    "missing_required": ["Docker"],
    "missing_preferred": []
  },
  "skill_gap_summary": "Good skill match...",
  "suggestions": [...]
}
```

---

#### Parse Resume
```
POST /parse-resume
```
Parses a resume file and extracts structured data.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file` (file): PDF or DOCX file

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-234-567-8900",
  "skills": ["Python", "JavaScript", "React"],
  "experience": ["Software Engineer at Company A", "..."],
  "education": ["BS Computer Science"],
  "projects": ["E-commerce Platform", "..."],
  "experience_years": 5,
  "organizations": ["Company A", "Company B"],
  "locations": ["San Francisco, CA"]
}
```

---

#### Parse Job Description
```
POST /parse-job
```
Parses a job description and extracts requirements.

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "text": "We are looking for a Software Engineer with 3+ years of experience in Python..."
}
```

**Response:**
```json
{
  "required_skills": ["Python", "SQL"],
  "preferred_skills": ["Docker", "Kubernetes"],
  "experience_required": 3,
  "education_required": "Bachelor's degree",
  "keywords": ["software engineer", "backend", "api"],
  "all_skills": ["Python", "SQL", "Docker", "Kubernetes"],
  "entities": {
    "organizations": [],
    "technologies": ["Python", "Docker"],
    "locations": ["Remote"]
  },
  "key_phrases": ["software development", "team collaboration"]
}
```

---

## Rate Limits

| Endpoint | Rate Limit |
|----------|------------|
| All /api/* | 100 requests per 15 minutes |
| /api/analyze-resume | 10 requests per minute |

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 413 | Payload Too Large - File exceeds 5MB |
| 415 | Unsupported Media Type - Invalid file format |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## File Requirements

- **Supported formats**: PDF, DOCX
- **Maximum file size**: 5MB
- **Recommended**: Single-page or two-page resumes for best results
