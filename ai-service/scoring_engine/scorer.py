from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List
import re


class ATSScorer:
    """Calculate ATS match score and generate suggestions."""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=1000
        )
        
        # Weak action verbs to flag
        self.weak_verbs = [
            'worked on', 'helped with', 'responsible for', 'assisted',
            'participated in', 'was involved in', 'handled', 'dealt with'
        ]
        
        # Strong action verbs to suggest
        self.strong_verbs = [
            'developed', 'implemented', 'designed', 'architected', 'built',
            'led', 'managed', 'optimized', 'improved', 'increased',
            'reduced', 'achieved', 'delivered', 'launched', 'created',
            'engineered', 'automated', 'streamlined', 'transformed'
        ]
        
        # Skill aliases for better matching (maps variations to canonical form)
        self.skill_aliases = {
            'rest api': ['rest apis', 'restful', 'restful api', 'restful apis', 'rest'],
            'javascript': ['js', 'es6', 'es6+', 'ecmascript'],
            'typescript': ['ts'],
            'python': ['python3', 'python 3'],
            'react': ['react.js', 'reactjs', 'react js'],
            'node.js': ['nodejs', 'node js', 'node'],
            'express': ['express.js', 'expressjs'],
            'mongodb': ['mongo', 'mongo db'],
            'postgresql': ['postgres', 'psql'],
            'mysql': ['my sql'],
            'docker': ['containerization', 'containers'],
            'kubernetes': ['k8s'],
            'ci/cd': ['cicd', 'ci cd', 'continuous integration', 'continuous deployment'],
            'aws': ['amazon web services'],
            'gcp': ['google cloud', 'google cloud platform'],
            'azure': ['microsoft azure'],
            'git': ['version control'],
            'github': ['git hub'],
            'gitlab': ['git lab'],
            'html': ['html5'],
            'css': ['css3'],
            'sql': ['structured query language'],
            'nosql': ['no sql', 'non-relational'],
            'microservices': ['micro services', 'micro-services'],
            'graphql': ['graph ql'],
            'tailwind': ['tailwind css', 'tailwindcss'],
            'material ui': ['mui', 'material-ui'],
            'next.js': ['nextjs', 'next js'],
            'vue': ['vue.js', 'vuejs'],
            'angular': ['angular.js', 'angularjs'],
            'django': ['django rest framework', 'drf'],
            'flask': ['flask api'],
            'spring': ['spring boot', 'springboot'],
            'redis': ['redis cache'],
            'elasticsearch': ['elastic search', 'elastic'],
            'firebase': ['firebase firestore'],
            'jwt': ['json web token', 'json web tokens'],
            'oauth': ['oauth2', 'oauth 2.0'],
            'linux': ['unix', 'ubuntu', 'centos', 'debian'],
            'agile': ['scrum', 'kanban'],
            'machine learning': ['ml'],
            'deep learning': ['dl'],
            'nlp': ['natural language processing'],
            'tensorflow': ['tf'],
            'pytorch': ['torch'],
        }

    def _normalize_skill(self, skill: str) -> str:
        """Normalize a skill to its canonical form."""
        skill_lower = skill.lower().strip()
        
        # Check if it's an alias
        for canonical, aliases in self.skill_aliases.items():
            if skill_lower == canonical or skill_lower in aliases:
                return canonical
        
        return skill_lower

    def _skills_match(self, skill1: str, skill2: str) -> bool:
        """Check if two skills match (including variations)."""
        norm1 = self._normalize_skill(skill1)
        norm2 = self._normalize_skill(skill2)
        
        # Direct match after normalization
        if norm1 == norm2:
            return True
        
        # Check if one contains the other (for partial matches)
        if norm1 in norm2 or norm2 in norm1:
            return True
        
        # Check if they share the same canonical form
        return False

    def calculate_score(self, resume_data: Dict, jd_data: Dict) -> Dict:
        """Calculate ATS match score between resume and job description."""
        # Get skills from both (normalized)
        resume_skills_raw = resume_data.get('skills', [])
        jd_skills_raw = jd_data.get('all_skills', [])
        
        # Normalize all skills
        resume_skills_normalized = {self._normalize_skill(s) for s in resume_skills_raw}
        jd_skills_normalized = {self._normalize_skill(s) for s in jd_skills_raw}
        
        # Also check raw text for skills that might not be extracted
        raw_text = resume_data.get('raw_text', '').lower()
        
        # Calculate matches with fuzzy matching
        matched_skills = set()
        missing_skills = set()
        
        for jd_skill in jd_skills_normalized:
            found = False
            
            # Check normalized resume skills
            if jd_skill in resume_skills_normalized:
                found = True
            else:
                # Check if skill appears in raw text
                if jd_skill in raw_text:
                    found = True
                else:
                    # Check aliases in raw text
                    aliases = self.skill_aliases.get(jd_skill, [])
                    for alias in aliases:
                        if alias in raw_text:
                            found = True
                            break
            
            if found:
                matched_skills.add(jd_skill)
            else:
                missing_skills.add(jd_skill)
        
        # Calculate skill score (40% weight)
        if jd_skills_normalized:
            skill_score = (len(matched_skills) / len(jd_skills_normalized)) * 100
        else:
            skill_score = 50  # Default if no skills in JD
        
        # Calculate text similarity using TF-IDF (25% weight)
        resume_text = resume_data.get('raw_text', '')
        # Create JD text from extracted data
        jd_text = ' '.join(jd_data.get('all_skills', []) + jd_data.get('keywords', []))
        
        text_score = self._calculate_text_similarity(resume_text, jd_text)
        
        # Calculate keyword frequency matching (15% weight)
        keyword_score = self._calculate_keyword_frequency(
            resume_text, 
            jd_data.get('keywords', []) + jd_data.get('all_skills', [])
        )
        
        # Experience match (20% weight)
        required_exp = jd_data.get('experience_required', 0)
        candidate_exp = resume_data.get('experience_years', 0)
        
        if required_exp > 0:
            exp_score = min(100, (candidate_exp / required_exp) * 100)
        else:
            exp_score = 80  # Default score if no requirement specified
        
        # Calculate weighted final score
        final_score = int(
            skill_score * 0.40 +
            text_score * 0.25 +
            keyword_score * 0.15 +
            exp_score * 0.20
        )
        
        # Ensure score is between 0-100
        final_score = max(0, min(100, final_score))
        
        # Categorize and rank skills
        skill_categories = self._categorize_skills(matched_skills, missing_skills, jd_data)
        
        return {
            'score': final_score,
            'matched_skills': [s.title() for s in matched_skills],
            'missing_skills': [s.title() for s in list(missing_skills)[:10]],  # Limit to 10
            'skill_score': int(skill_score),
            'text_score': int(text_score),
            'keyword_score': int(keyword_score),
            'experience_score': int(exp_score),
            'skill_categories': skill_categories,
            'skill_gap_summary': self._generate_skill_gap_summary(matched_skills, missing_skills)
        }

    def _calculate_keyword_frequency(self, text: str, keywords: List[str]) -> float:
        """Calculate keyword frequency score based on how often JD keywords appear in resume."""
        if not text or not keywords:
            return 50.0
        
        text_lower = text.lower()
        total_matches = 0
        keyword_matches = {}
        
        for keyword in keywords:
            keyword_lower = keyword.lower()
            count = text_lower.count(keyword_lower)
            if count > 0:
                keyword_matches[keyword] = count
                total_matches += min(count, 3)  # Cap at 3 per keyword
        
        # Score based on percentage of keywords found and frequency
        keywords_found = len(keyword_matches)
        total_keywords = len(keywords)
        
        if total_keywords == 0:
            return 50.0
        
        # Base score from keywords found (0-70%)
        base_score = (keywords_found / total_keywords) * 70
        
        # Bonus for frequency (0-30%)
        max_frequency_bonus = min(total_matches / (total_keywords * 2), 1) * 30
        
        return min(base_score + max_frequency_bonus, 100)

    def _categorize_skills(self, matched: set, missing: set, jd_data: Dict) -> Dict:
        """Categorize skills by type and importance."""
        required = set(s.lower() for s in jd_data.get('required_skills', []))
        preferred = set(s.lower() for s in jd_data.get('preferred_skills', []))
        
        return {
            'matched_required': [s.title() for s in matched.intersection(required)],
            'matched_preferred': [s.title() for s in matched.intersection(preferred)],
            'missing_required': [s.title() for s in missing.intersection(required)],
            'missing_preferred': [s.title() for s in missing.intersection(preferred)],
        }

    def _generate_skill_gap_summary(self, matched: set, missing: set) -> str:
        """Generate a summary of the skill gap analysis."""
        total = len(matched) + len(missing)
        if total == 0:
            return "Unable to analyze skills - please ensure your resume includes a skills section."
        
        match_rate = len(matched) / total * 100
        
        if match_rate >= 80:
            return f"Excellent skill match ({match_rate:.0f}%)! Your resume aligns well with the job requirements."
        elif match_rate >= 60:
            return f"Good skill match ({match_rate:.0f}%). Consider adding {len(missing)} missing skills to strengthen your application."
        elif match_rate >= 40:
            return f"Moderate skill match ({match_rate:.0f}%). Focus on acquiring the {len(missing)} missing skills for this role."
        else:
            return f"Low skill match ({match_rate:.0f}%). This role may require significant upskilling in {len(missing)} areas."

    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate cosine similarity between two texts using TF-IDF."""
        try:
            if not text1 or not text2:
                return 50.0
            
            # Fit and transform both texts
            tfidf_matrix = self.vectorizer.fit_transform([text1, text2])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Convert to percentage (0-100)
            return similarity * 100
        except Exception:
            return 50.0  # Default score on error

    def generate_suggestions(self, resume_data: Dict) -> List[Dict]:
        """Generate improvement suggestions for resume bullet points."""
        suggestions = []
        
        # Get experience entries and raw text
        experience = resume_data.get('experience', [])
        raw_text = resume_data.get('raw_text', '')
        
        # Analyze for weak patterns
        text_to_analyze = '\n'.join(experience) if experience else raw_text
        
        # Find bullet points (lines starting with common bullet markers)
        bullet_pattern = r'^[\s]*[•\-\*\>\→]\s*(.+)$'
        bullets = re.findall(bullet_pattern, text_to_analyze, re.MULTILINE)
        
        # Also look for sentence-like statements
        if not bullets:
            bullets = [line.strip() for line in text_to_analyze.split('\n') 
                      if len(line.strip()) > 20 and len(line.strip()) < 200]
        
        for bullet in bullets[:15]:  # Analyze up to 15 bullets
            issues = self._analyze_bullet(bullet)
            if issues:
                improved = self._improve_bullet(bullet, issues)
                suggestions.append({
                    'original': bullet,
                    'suggestion': improved,
                    'issues': issues
                })
        
        # If we have few suggestions, also suggest improvements for good bullets
        if len(suggestions) < 5:
            for bullet in bullets[:15]:
                if bullet not in [s['original'] for s in suggestions]:
                    # Add general enhancement suggestions
                    suggestions.append({
                        'original': bullet,
                        'suggestion': f"{bullet} → Consider adding: specific technologies, team size, or quantifiable business impact",
                        'issues': ['can_be_enhanced']
                    })
                    if len(suggestions) >= 7:
                        break
        
        return suggestions[:7]  # Return top 7 suggestions

    def _analyze_bullet(self, bullet: str) -> List[str]:
        """Analyze a bullet point for common issues."""
        issues = []
        bullet_lower = bullet.lower()
        words = bullet_lower.split()
        
        # Check for weak verbs
        for verb in self.weak_verbs:
            if verb in bullet_lower:
                issues.append(f'weak_verb:{verb}')
                break
        
        # Check for missing metrics (numbers, percentages, dollar amounts)
        has_numbers = bool(re.search(r'\d+[%$KkMm]?|\$\d+', bullet))
        if not has_numbers:
            issues.append('no_metrics')
        
        # Check for passive voice indicators (only at start of sentence or after comma)
        passive_patterns = [r'^was\s', r'^were\s', r',\s*was\s', r',\s*were\s']
        is_passive = any(re.search(p, bullet_lower) for p in passive_patterns)
        if is_passive:
            issues.append('passive_voice')
        
        # Check for vague language - only flag if actually vague (not part of compound words)
        vague_words = ['various', 'multiple', 'several', 'some', 'many', 'things', 'stuff', 'etc']
        for vague in vague_words:
            # Check it's a standalone word, not part of another word
            if re.search(r'\b' + vague + r'\b', bullet_lower):
                issues.append('vague_language')
                break
        
        # Only return issues if we found actual problems worth fixing
        # A good bullet (strong verb + metrics + specific) shouldn't be flagged
        first_word = words[0] if words else ''
        starts_with_strong_verb = first_word in [v.lower() for v in self.strong_verbs]
        
        # If starts with strong verb and has metrics, only flag if there's actual vague language
        if starts_with_strong_verb and has_numbers:
            issues = [i for i in issues if i == 'vague_language']
        
        return issues

    def _improve_bullet(self, bullet: str, issues: List[str]) -> str:
        """Generate an improved version of a bullet point."""
        improved = bullet
        changes_made = []
        
        # Replace weak verbs
        weak_verb_replacements = {
            'worked on': 'Developed',
            'helped with': 'Contributed to',
            'responsible for': 'Led',
            'assisted': 'Supported',
            'participated in': 'Collaborated on',
            'was involved in': 'Drove',
            'handled': 'Managed',
            'dealt with': 'Resolved'
        }
        
        for weak, strong in weak_verb_replacements.items():
            if weak in improved.lower():
                improved = re.sub(weak, strong, improved, flags=re.IGNORECASE)
                changes_made.append(f'replaced "{weak}" with "{strong}"')
        
        # Handle vague language
        vague_replacements = {
            'various': 'specific',
            'multiple': 'several key',
            'several': 'three',
            'some': 'targeted',
            'many': 'numerous',
            'things': 'components'
        }
        
        for vague, specific in vague_replacements.items():
            pattern = r'\b' + vague + r'\b'
            if re.search(pattern, improved, re.IGNORECASE):
                improved = re.sub(pattern, specific, improved, flags=re.IGNORECASE)
                changes_made.append(f'replaced "{vague}" with "{specific}"')
        
        # Handle passive voice
        if 'passive_voice' in issues:
            passive_fixes = {
                r'\bwas developed\b': 'Developed',
                r'\bwere created\b': 'Created',
                r'\bwas implemented\b': 'Implemented',
                r'\bwere designed\b': 'Designed',
                r'\bwas built\b': 'Built',
                r'\bwas managed\b': 'Managed',
            }
            for passive, active in passive_fixes.items():
                if re.search(passive, improved, re.IGNORECASE):
                    improved = re.sub(passive, active, improved, flags=re.IGNORECASE)
                    changes_made.append('converted passive to active voice')
                    break
        
        # Add metric suggestions if missing
        if 'no_metrics' in issues and not changes_made:
            improved += ' → Add metrics: quantify impact (e.g., "reduced load time by 40%", "serving 10K+ users")'
            changes_made.append('suggested adding metrics')
        
        # If flagged but no changes made, provide actionable improvement
        if not changes_made:
            # Check if it starts with a strong verb
            first_word = improved.split()[0].lower() if improved else ''
            strong_verbs_lower = [v.lower() for v in self.strong_verbs]
            
            if first_word not in strong_verbs_lower:
                # Suggest rewriting with a strong verb
                improved = f"→ Rewrite with impact: Engineered {improved.lower()} achieving [X% improvement/Y users impacted]"
            else:
                # Already starts with strong verb, suggest adding specifics
                improved = f"{improved} → Strengthen by adding: specific technologies used, team size, or business impact"
        
        return improved
