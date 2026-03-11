from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from resume_parser.parser import ResumeParser
from job_matcher.matcher import JobMatcher
from scoring_engine.scorer import ATSScorer
import tempfile
import os
import hashlib
import time
from functools import lru_cache
from typing import Dict, Any
from cachetools import TTLCache

app = FastAPI(title="AI Resume Analyzer Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (loaded once at startup)
resume_parser = ResumeParser()
job_matcher = JobMatcher()
ats_scorer = ATSScorer()

# Cache for job descriptions (TTL: 1 hour, max 100 entries)
jd_cache: TTLCache = TTLCache(maxsize=100, ttl=3600)

# Cache for analysis results (TTL: 30 minutes, max 50 entries)
analysis_cache: TTLCache = TTLCache(maxsize=50, ttl=1800)


def get_content_hash(content: str) -> str:
    """Generate a hash for content to use as cache key."""
    return hashlib.md5(content.encode()).hexdigest()


def get_file_hash(content: bytes) -> str:
    """Generate a hash for file content to use as cache key."""
    return hashlib.md5(content).hexdigest()


@lru_cache(maxsize=50)
def cached_parse_job_description(jd_hash: str, job_description: str) -> Dict[str, Any]:
    """Cache job description parsing results using LRU cache."""
    return job_matcher.parse_job_description(job_description)


@app.get("/")
async def root():
    return {
        "name": "AI Resume Analyzer - AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "GET /health",
            "analyze": "POST /analyze",
            "parseResume": "POST /parse-resume",
            "parseJob": "POST /parse-job",
            "cacheStats": "GET /cache-stats"
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-resume-analyzer"}


@app.get("/cache-stats")
async def cache_stats():
    """Get cache statistics for monitoring."""
    return {
        "jd_cache": {
            "size": len(jd_cache),
            "maxsize": jd_cache.maxsize,
            "ttl": jd_cache.ttl
        },
        "analysis_cache": {
            "size": len(analysis_cache),
            "maxsize": analysis_cache.maxsize,
            "ttl": analysis_cache.ttl
        },
        "lru_cache_info": cached_parse_job_description.cache_info()._asdict()
    }


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Analyze a resume against a job description.
    Returns ATS score, matched/missing skills, and improvement suggestions.
    Optimized with caching for < 5 second response time.
    """
    start_time = time.time()
    
    try:
        # Read file content once
        content = await resume.read()
        
        # Generate cache keys
        resume_hash = get_file_hash(content)
        jd_hash = get_content_hash(job_description)
        combined_key = f"{resume_hash}_{jd_hash}"
        
        # Check analysis cache first
        if combined_key in analysis_cache:
            cached_result = analysis_cache[combined_key]
            cached_result["cached"] = True
            cached_result["response_time_ms"] = round((time.time() - start_time) * 1000, 2)
            return cached_result
        
        # Save uploaded file temporarily
        suffix = os.path.splitext(resume.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            # Parse resume (this is the most expensive operation)
            resume_data = resume_parser.parse(tmp_path)
            
            # Parse job description with caching
            jd_data = cached_parse_job_description(jd_hash, job_description)
            
            # Calculate ATS score
            analysis_result = ats_scorer.calculate_score(resume_data, jd_data)
            
            # Generate suggestions
            suggestions = ats_scorer.generate_suggestions(resume_data)
            
            result = {
                "ats_score": analysis_result["score"],
                "matched_skills": analysis_result["matched_skills"],
                "missing_skills": analysis_result["missing_skills"],
                "suggestions": suggestions,
                "resume_data": {
                    "name": resume_data.get("name", ""),
                    "skills": resume_data.get("skills", []),
                    "experience_years": resume_data.get("experience_years", 0)
                },
                "cached": False,
                "response_time_ms": round((time.time() - start_time) * 1000, 2)
            }
            
            # Cache the result
            analysis_cache[combined_key] = result
            
            return result
        finally:
            # Clean up temp file
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/parse-resume")
async def parse_resume(resume: UploadFile = File(...)):
    """Parse a resume and extract structured data."""
    start_time = time.time()
    
    try:
        suffix = os.path.splitext(resume.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            content = await resume.read()
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            resume_data = resume_parser.parse(tmp_path)
            resume_data["response_time_ms"] = round((time.time() - start_time) * 1000, 2)
            return resume_data
        finally:
            os.unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/parse-job")
async def parse_job(job_description: str = Form(...)):
    """Parse a job description and extract requirements. Results are cached."""
    start_time = time.time()
    
    try:
        jd_hash = get_content_hash(job_description)
        
        # Check TTL cache first
        if jd_hash in jd_cache:
            cached_result = jd_cache[jd_hash].copy()
            cached_result["cached"] = True
            cached_result["response_time_ms"] = round((time.time() - start_time) * 1000, 2)
            return cached_result
        
        # Parse and cache
        jd_data = cached_parse_job_description(jd_hash, job_description)
        jd_cache[jd_hash] = jd_data
        
        result = jd_data.copy()
        result["cached"] = False
        result["response_time_ms"] = round((time.time() - start_time) * 1000, 2)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/cache/clear")
async def clear_cache():
    """Clear all caches. Useful for testing or when data becomes stale."""
    jd_cache.clear()
    analysis_cache.clear()
    cached_parse_job_description.cache_clear()
    return {"status": "ok", "message": "All caches cleared"}


@app.get("/health")
async def health_check():
    """Health check endpoint for Railway."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
