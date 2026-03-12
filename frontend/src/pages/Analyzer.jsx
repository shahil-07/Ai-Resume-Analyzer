import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowLeft, RotateCcw, Clipboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import FileUpload from '../components/FileUpload'
import ScoreCircle from '../components/ScoreCircle'
import SkillsDisplay from '../components/SkillsDisplay'
import SuggestionsPanel from '../components/SuggestionsPanel'
import ResultSummary from '../components/ResultSummary'

const Analyzer = () => {
  const apiBaseUrl = import.meta.env.VITE_API_URL
    || (import.meta.env.DEV ? '/api' : 'https://ai-resume-analyzer-backend-production-8d09.up.railway.app')
  const normalizedApiBaseUrl = apiBaseUrl.endsWith('/api') || apiBaseUrl.endsWith('/api/')
    ? apiBaseUrl.replace(/\/$/, '')
    : `${apiBaseUrl.replace(/\/$/, '')}/api`
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('score')

  const handleAnalyze = async () => {
    if (!file || !jobDescription.trim()) {
      setError('Please upload a resume and enter a job description')
      return
    }

    setError(null)
    setIsAnalyzing(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jobDescription', jobDescription)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const response = await fetch(`${normalizedApiBaseUrl}/analyze-resume`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')

      if (!response.ok) {
        if (isJson) {
          const errorData = await response.json()
          throw new Error(errorData?.error || 'Analysis failed. Please try again.')
        }
        const errorText = await response.text()
        throw new Error(errorText || 'Analysis failed. Please try again.')
      }

      if (!isJson) {
        throw new Error('Unexpected response format. Please try again.')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setUploadProgress(0)
    }
  }

  const handleReset = () => {
    setFile(null)
    setJobDescription('')
    setResults(null)
    setError(null)
    setActiveTab('score')
  }

  const tabs = [
    { id: 'score', label: 'ATS Score' },
    { id: 'skills', label: 'Skills' },
    { id: 'suggestions', label: 'Suggestions' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Resume Analyzer</h1>
          </div>
          {results && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!results ? (
            /* Input Section */
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-8"
            >
              {/* Left - Resume Upload */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Resume</h2>
                <FileUpload
                  file={file}
                  onFileSelect={setFile}
                  onClear={() => setFile(null)}
                  uploading={isAnalyzing}
                  uploadProgress={uploadProgress}
                />
              </div>

              {/* Right - Job Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText()
                        setJobDescription(text)
                      } catch (err) {
                        console.error('Failed to read clipboard:', err)
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Clipboard className="w-4 h-4" />
                    Paste
                  </button>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {jobDescription.length} characters
                  </p>
                  {jobDescription.length > 0 && jobDescription.length < 100 && (
                    <p className="text-sm text-amber-600">
                      Add more details for better analysis
                    </p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="lg:col-span-2 bg-red-50 text-red-600 p-4 rounded-xl text-center">
                  {error}
                </div>
              )}

              {/* Analyze Button */}
              <div className="lg:col-span-2 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !file || !jobDescription.trim()}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Resume'
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* Results Section */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Result Summary Card */}
              <ResultSummary results={results} />

              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <AnimatePresence mode="wait">
                  {activeTab === 'score' && (
                    <motion.div
                      key="score-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center py-8"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-8">ATS Match Score</h3>
                      <ScoreCircle score={results.ats_score} size="large" />
                      <p className="mt-6 text-gray-600 text-center max-w-md">
                        Your resume matches <strong>{results.ats_score}%</strong> of the job requirements.
                        {results.ats_score < 75 && " Consider adding the missing skills to improve your chances."}
                      </p>
                    </motion.div>
                  )}

                  {activeTab === 'skills' && (
                    <motion.div
                      key="skills-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <SkillsDisplay
                        matchedSkills={results.matched_skills}
                        missingSkills={results.missing_skills}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'suggestions' && (
                    <motion.div
                      key="suggestions-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <SuggestionsPanel suggestions={results.suggestions} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Analyzer
