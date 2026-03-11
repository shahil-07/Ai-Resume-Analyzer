const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// AI Service URL
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

module.exports = (upload, analysisLimiter) => {
  // Analyze resume endpoint
  router.post('/analyze-resume', analysisLimiter, upload.single('resume'), async (req, res) => {
    try {
      const { jobDescription } = req.body;
      const resumeFile = req.file;

      if (!resumeFile) {
        return res.status(400).json({ error: 'Resume file is required' });
      }

      if (!jobDescription) {
        return res.status(400).json({ error: 'Job description is required' });
      }

      // Read the file
      const filePath = path.join(__dirname, '..', resumeFile.path);
      
      // For MVP: Send to AI service for analysis
      // In production, this would call the Python AI service
      try {
        const FormData = require('form-data');
        const fetch = require('node-fetch');
        
        const formData = new FormData();
        formData.append('resume', fs.createReadStream(filePath));
        formData.append('job_description', jobDescription);

        const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          
          // Clean up uploaded file
          fs.unlinkSync(filePath);
          
          return res.json(result);
        }
      } catch (aiError) {
        console.log('AI Service not available, using mock data');
      }

      // Mock response for development/demo
      const mockResult = generateMockAnalysis(jobDescription);
      
      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json(mockResult);
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze resume' });
    }
  });

  // Upload resume endpoint (separate from analysis)
  router.post('/upload-resume', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename,
        size: req.file.size
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload file' });
    }
  });

  return router;
};

// Mock analysis function for development
function generateMockAnalysis(jobDescription) {
  // Extract some keywords from job description for demo
  const jdLower = jobDescription.toLowerCase();
  
  const allSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'REST API', 'GraphQL', 'HTML', 'CSS', 'Tailwind',
    'Express.js', 'Next.js', 'Vue.js', 'Angular', 'Redis'
  ];

  const matchedSkills = [];
  const missingSkills = [];

  allSkills.forEach(skill => {
    if (jdLower.includes(skill.toLowerCase())) {
      // Randomly decide if skill is matched (70% chance for demo)
      if (Math.random() > 0.3) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }
  });

  // Ensure we have some skills for demo
  if (matchedSkills.length === 0) {
    matchedSkills.push('JavaScript', 'React', 'Node.js');
  }
  if (missingSkills.length === 0) {
    missingSkills.push('Docker', 'AWS', 'Kubernetes');
  }

  // Calculate score based on match ratio
  const totalSkills = matchedSkills.length + missingSkills.length;
  const atsScore = Math.round((matchedSkills.length / totalSkills) * 100);

  return {
    ats_score: Math.max(45, Math.min(95, atsScore + Math.floor(Math.random() * 20))),
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    suggestions: [
      {
        original: "Worked on web development projects",
        suggestion: "Developed and deployed 5+ full-stack web applications using React and Node.js, resulting in 40% improvement in user engagement"
      },
      {
        original: "Responsible for database management",
        suggestion: "Architected and optimized MongoDB database schemas, reducing query response time by 60% for 100K+ daily active users"
      },
      {
        original: "Fixed bugs in the application",
        suggestion: "Identified and resolved 50+ critical bugs through systematic debugging, improving application stability by 35%"
      }
    ]
  };
}
