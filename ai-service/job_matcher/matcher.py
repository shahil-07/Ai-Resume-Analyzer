import re
import spacy
from typing import Dict, List


class JobMatcher:
    """Parse job descriptions and extract requirements using NLP."""
    
    def __init__(self):
        # Load spaCy model for NLP-based extraction
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            import os
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
        # Common technical skills to look for
        self.tech_skills = [
            'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
            'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'jquery',
            'node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'rails',
            'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'cassandra', 'dynamodb',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible',
            'git', 'github', 'gitlab', 'bitbucket', 'ci/cd', 'jenkins', 'circleci',
            'html', 'css', 'tailwind', 'sass', 'less', 'bootstrap', 'material-ui',
            'rest api', 'graphql', 'grpc', 'microservices', 'serverless',
            'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'scikit-learn',
            'sql', 'nosql', 'linux', 'unix', 'bash', 'shell',
            'agile', 'scrum', 'kanban', 'jira', 'confluence',
            'unit testing', 'jest', 'pytest', 'selenium', 'cypress'
        ]
        
        # Soft skills
        self.soft_skills = [
            'communication', 'leadership', 'teamwork', 'problem solving',
            'analytical', 'creative', 'detail-oriented', 'time management',
            'collaboration', 'mentoring', 'project management'
        ]

    def parse_job_description(self, jd_text: str) -> Dict:
        """Parse a job description and extract requirements using NLP."""
        # Use spaCy for enhanced NLP extraction
        nlp_data = self._extract_with_nlp(jd_text)
        
        return {
            'required_skills': self._extract_required_skills(jd_text),
            'preferred_skills': self._extract_preferred_skills(jd_text),
            'experience_required': self._extract_experience_requirement(jd_text),
            'education_required': self._extract_education_requirement(jd_text),
            'keywords': self._extract_keywords(jd_text),
            'all_skills': self._extract_all_skills(jd_text),
            'entities': nlp_data.get('entities', {}),
            'key_phrases': nlp_data.get('noun_phrases', [])
        }

    def _extract_with_nlp(self, text: str) -> Dict:
        """Use spaCy NLP to extract entities and key phrases."""
        doc = self.nlp(text[:50000])  # Limit for performance
        
        entities = {
            'organizations': [],
            'technologies': [],
            'locations': []
        }
        
        # Extract named entities
        for ent in doc.ents:
            if ent.label_ == 'ORG' and ent.text not in entities['organizations']:
                entities['organizations'].append(ent.text)
            elif ent.label_ in ['GPE', 'LOC'] and ent.text not in entities['locations']:
                entities['locations'].append(ent.text)
            elif ent.label_ == 'PRODUCT' and ent.text not in entities['technologies']:
                entities['technologies'].append(ent.text)
        
        # Extract noun phrases as potential skills/requirements
        noun_phrases = []
        for chunk in doc.noun_chunks:
            phrase = chunk.text.lower().strip()
            # Filter useful noun phrases (2-4 words, likely technical)
            words = phrase.split()
            if 1 <= len(words) <= 4 and len(phrase) > 3:
                noun_phrases.append(phrase)
        
        # Remove duplicates and limit
        noun_phrases = list(set(noun_phrases))[:30]
        
        return {
            'entities': entities,
            'noun_phrases': noun_phrases
        }

    def _extract_required_skills(self, text: str) -> List[str]:
        """Extract required/must-have skills."""
        required_skills = []
        text_lower = text.lower()
        
        # Look for skills mentioned after "required", "must have", etc.
        required_patterns = [
            r'required[:\s]+(.+?)(?=preferred|nice to have|bonus|\n\n|$)',
            r'must have[:\s]+(.+?)(?=preferred|nice to have|bonus|\n\n|$)',
            r'requirements[:\s]+(.+?)(?=preferred|nice to have|bonus|\n\n|$)'
        ]
        
        for pattern in required_patterns:
            match = re.search(pattern, text_lower, re.DOTALL | re.IGNORECASE)
            if match:
                section = match.group(1)
                for skill in self.tech_skills:
                    if re.search(r'\b' + re.escape(skill) + r'\b', section):
                        required_skills.append(skill.title() if skill.islower() else skill)
        
        # If no specific section found, treat all mentioned skills as potentially required
        if not required_skills:
            required_skills = self._extract_all_skills(text)[:10]
        
        return list(set(required_skills))

    def _extract_preferred_skills(self, text: str) -> List[str]:
        """Extract preferred/nice-to-have skills."""
        preferred_skills = []
        text_lower = text.lower()
        
        preferred_patterns = [
            r'preferred[:\s]+(.+?)(?=\n\n|$)',
            r'nice to have[:\s]+(.+?)(?=\n\n|$)',
            r'bonus[:\s]+(.+?)(?=\n\n|$)',
            r'plus[:\s]+(.+?)(?=\n\n|$)'
        ]
        
        for pattern in preferred_patterns:
            match = re.search(pattern, text_lower, re.DOTALL | re.IGNORECASE)
            if match:
                section = match.group(1)
                for skill in self.tech_skills:
                    if re.search(r'\b' + re.escape(skill) + r'\b', section):
                        preferred_skills.append(skill.title() if skill.islower() else skill)
        
        return list(set(preferred_skills))

    def _extract_all_skills(self, text: str) -> List[str]:
        """Extract all mentioned technical skills."""
        found_skills = []
        text_lower = text.lower()
        
        for skill in self.tech_skills:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text_lower):
                found_skills.append(skill.title() if skill.islower() else skill)
        
        return list(set(found_skills))

    def _extract_experience_requirement(self, text: str) -> int:
        """Extract years of experience required."""
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)',
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:professional|work)',
            r'minimum\s*(?:of\s+)?(\d+)\s*(?:years?|yrs?)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return int(match.group(1))
        
        return 0

    def _extract_education_requirement(self, text: str) -> str:
        """Extract education requirements."""
        text_lower = text.lower()
        
        if any(term in text_lower for term in ['phd', 'doctorate', 'doctoral']):
            return "PhD"
        elif any(term in text_lower for term in ["master's", 'masters', 'msc', 'mba', 'ms degree']):
            return "Master's"
        elif any(term in text_lower for term in ["bachelor's", 'bachelors', 'bs', 'ba', 'bsc', 'undergraduate']):
            return "Bachelor's"
        elif 'degree' in text_lower:
            return "Degree Required"
        
        return "Not Specified"

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from job description."""
        # Combine tech skills and common industry terms
        keywords = self._extract_all_skills(text)
        
        # Add soft skills if mentioned
        text_lower = text.lower()
        for skill in self.soft_skills:
            if skill in text_lower:
                keywords.append(skill.title())
        
        return list(set(keywords))
