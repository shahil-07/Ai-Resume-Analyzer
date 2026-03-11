import fitz  # PyMuPDF
from docx import Document
import re
import os
import spacy


class ResumeParser:
    """Parse resumes from PDF and DOCX files."""
    
    def __init__(self):
        # Load spaCy model for NLP
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spaCy model...")
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
        self.section_headers = [
            'education', 'experience', 'work experience', 'employment',
            'skills', 'technical skills', 'projects', 'certifications',
            'summary', 'objective', 'professional summary'
        ]
        
        # Common tech skills for extraction (include variations)
        self.tech_skills = [
            'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust',
            'react', 'react.js', 'reactjs', 'angular', 'vue', 'vue.js', 'svelte', 'next.js', 'nuxt',
            'node.js', 'nodejs', 'express', 'express.js', 'fastapi', 'django', 'flask', 'spring',
            'mongodb', 'mongo', 'postgresql', 'postgres', 'mysql', 'redis', 'elasticsearch', 'firebase',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform',
            'git', 'github', 'gitlab', 'ci/cd', 'jenkins',
            'html', 'html5', 'css', 'css3', 'tailwind', 'tailwind css', 'sass', 'bootstrap', 'material ui',
            'rest api', 'rest apis', 'restful', 'graphql', 'grpc', 'microservices',
            'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch',
            'sql', 'nosql', 'linux', 'agile', 'scrum', 'jwt', 'postman'
        ]
        
        # Map skill variations to canonical names
        self.skill_canonical = {
            'react.js': 'React',
            'reactjs': 'React',
            'react': 'React',
            'vue.js': 'Vue',
            'node.js': 'Node.js',
            'nodejs': 'Node.js',
            'express.js': 'Express',
            'html5': 'HTML',
            'css3': 'CSS',
            'tailwind css': 'Tailwind',
            'mongodb': 'MongoDB',
            'mongo': 'MongoDB',
            'postgresql': 'PostgreSQL',
            'postgres': 'PostgreSQL',
            'k8s': 'Kubernetes',
            'rest api': 'REST API',
            'rest apis': 'REST API',
            'restful': 'REST API',
        }

    def parse(self, file_path: str) -> dict:
        """Parse a resume file and extract structured data."""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            text = self._extract_pdf(file_path)
        elif ext == '.docx':
            text = self._extract_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")
        
        return self._parse_text(text)

    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            raise Exception(f"Failed to parse PDF: {str(e)}")
        return text

    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        try:
            doc = Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            raise Exception(f"Failed to parse DOCX: {str(e)}")
        return text

    def _parse_text(self, text: str) -> dict:
        """Parse extracted text into structured data."""
        lines = text.split('\n')
        lines = [line.strip() for line in lines if line.strip()]
        
        # Use spaCy for NLP entity extraction
        nlp_entities = self._extract_entities_nlp(text)
        
        result = {
            'name': nlp_entities.get('name') or self._extract_name(lines),
            'email': self._extract_email(text),
            'phone': self._extract_phone(text),
            'skills': self._extract_skills(text),
            'experience': self._extract_experience(text),
            'education': self._extract_education(text),
            'projects': self._extract_projects(text),
            'experience_years': self._estimate_experience_years(text),
            'organizations': nlp_entities.get('organizations', []),
            'locations': nlp_entities.get('locations', []),
            'raw_text': text
        }
        
        return result

    def _extract_entities_nlp(self, text: str) -> dict:
        """Extract named entities using spaCy NLP."""
        # Process text with spaCy (limit to first 100k chars for performance)
        doc = self.nlp(text[:100000])
        
        entities = {
            'name': None,
            'organizations': [],
            'locations': [],
            'dates': []
        }
        
        for ent in doc.ents:
            if ent.label_ == 'PERSON' and not entities['name']:
                # First person entity is likely the candidate name
                entities['name'] = ent.text.strip()
            elif ent.label_ == 'ORG':
                org = ent.text.strip()
                if org not in entities['organizations'] and len(org) < 100:
                    entities['organizations'].append(org)
            elif ent.label_ in ['GPE', 'LOC']:
                loc = ent.text.strip()
                if loc not in entities['locations'] and len(loc) < 50:
                    entities['locations'].append(loc)
            elif ent.label_ == 'DATE':
                entities['dates'].append(ent.text.strip())
        
        # Limit lists
        entities['organizations'] = entities['organizations'][:10]
        entities['locations'] = entities['locations'][:5]
        
        return entities

    def _extract_name(self, lines: list) -> str:
        """Extract candidate name (usually first non-empty line)."""
        for line in lines[:5]:  # Check first 5 lines
            # Skip lines that look like contact info
            if '@' in line or re.search(r'\d{3}[-.]?\d{3}[-.]?\d{4}', line):
                continue
            # Skip common headers
            if any(header in line.lower() for header in self.section_headers):
                continue
            # Return if it looks like a name (2-4 words, mostly letters)
            words = line.split()
            if 1 <= len(words) <= 4 and all(re.match(r'^[A-Za-z\-\'\.]+$', w) for w in words):
                return line
        return ""

    def _extract_email(self, text: str) -> str:
        """Extract email address."""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(email_pattern, text)
        return match.group(0) if match else ""

    def _extract_phone(self, text: str) -> str:
        """Extract phone number."""
        phone_pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
        match = re.search(phone_pattern, text)
        return match.group(0) if match else ""

    def _extract_skills(self, text: str) -> list:
        """Extract technical skills from resume."""
        text_lower = text.lower()
        found_skills = set()
        
        for skill in self.tech_skills:
            # Use word boundaries for accurate matching
            # Handle skills with special chars like "c++" or "node.js"
            escaped_skill = re.escape(skill)
            # Allow optional .js suffix and variations
            pattern = r'\b' + escaped_skill.replace(r'\.', r'\.?') + r'(?:\.js)?\b'
            if re.search(pattern, text_lower):
                # Use canonical name if available, otherwise title case
                canonical = self.skill_canonical.get(skill, skill.title())
                found_skills.add(canonical)
        
        # Also look for skills in a skills section
        skills_section = self._extract_section(text, ['skills', 'technical skills'])
        if skills_section:
            # Split by common delimiters
            section_skills = re.split(r'[,;|•·\n]', skills_section)
            for skill in section_skills:
                skill = skill.strip()
                skill_lower = skill.lower()
                if skill and len(skill) < 30:
                    # Check if it matches a known skill
                    canonical = self.skill_canonical.get(skill_lower)
                    if canonical:
                        found_skills.add(canonical)
                    elif skill_lower not in [s.lower() for s in found_skills]:
                        found_skills.add(skill)
        
        return list(found_skills)[:25]  # Limit to 25 skills

    def _extract_experience(self, text: str) -> list:
        """Extract work experience entries."""
        experience_section = self._extract_section(text, ['experience', 'work experience', 'employment'])
        if not experience_section:
            return []
        
        # This is a simplified extraction - could be enhanced with NLP
        entries = []
        lines = experience_section.split('\n')
        current_entry = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_entry:
                    entries.append('\n'.join(current_entry))
                    current_entry = []
            else:
                current_entry.append(line)
        
        if current_entry:
            entries.append('\n'.join(current_entry))
        
        return entries[:5]  # Limit to 5 entries

    def _extract_education(self, text: str) -> list:
        """Extract education entries."""
        education_section = self._extract_section(text, ['education'])
        if not education_section:
            return []
        
        lines = [line.strip() for line in education_section.split('\n') if line.strip()]
        return lines[:3]  # Limit to 3 entries

    def _extract_projects(self, text: str) -> list:
        """Extract project entries from resume."""
        projects_section = self._extract_section(text, ['projects', 'personal projects', 'portfolio'])
        if not projects_section:
            return []
        
        entries = []
        lines = projects_section.split('\n')
        current_entry = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_entry:
                    entries.append('\n'.join(current_entry))
                    current_entry = []
            else:
                current_entry.append(line)
        
        if current_entry:
            entries.append('\n'.join(current_entry))
        
        return entries[:5]  # Limit to 5 projects

    def _extract_section(self, text: str, headers: list) -> str:
        """Extract a section from the resume based on header."""
        text_lower = text.lower()
        
        for header in headers:
            pattern = rf'\b{header}\b[:\s]*\n?'
            match = re.search(pattern, text_lower)
            if match:
                start = match.end()
                # Find the next section header
                next_section = len(text)
                for other_header in self.section_headers:
                    if other_header != header:
                        next_match = re.search(rf'\b{other_header}\b', text_lower[start:])
                        if next_match:
                            next_section = min(next_section, start + next_match.start())
                
                return text[start:next_section].strip()
        
        return ""

    def _estimate_experience_years(self, text: str) -> int:
        """Estimate years of experience from resume."""
        # Look for year ranges
        year_pattern = r'(20\d{2}|19\d{2})\s*[-–—to]+\s*(20\d{2}|19\d{2}|present|current)'
        matches = re.findall(year_pattern, text.lower())
        
        total_years = 0
        for start, end in matches:
            start_year = int(start)
            if end in ['present', 'current']:
                end_year = 2026  # Current year
            else:
                end_year = int(end)
            total_years += max(0, end_year - start_year)
        
        return min(total_years, 30)  # Cap at 30 years
