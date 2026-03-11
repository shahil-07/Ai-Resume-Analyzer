import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'

const Hero = () => {
  return (
    <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-br from-white via-indigo-50/30 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Optimize Your Resume for{' '}
              <span className="text-indigo-600">ATS</span> in Seconds
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-xl">
              Upload your resume and compare it with any job description.
              Get instant ATS score and AI-powered suggestions to land more interviews.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                to="/analyzer"
                className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Analyze My Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                View Demo
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Free to use
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                No sign-up required
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Instant results
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-indigo-500/10 border border-gray-100 p-6 lg:p-8">
              {/* Mock Dashboard Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">ATS Match Score</span>
                  <span className="text-sm text-green-600 font-medium">Excellent</span>
                </div>
                
                {/* Score Circle */}
                <div className="flex justify-center py-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#6366f1"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray="351.86"
                        strokeDashoffset="87.96"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">75%</span>
                    </div>
                  </div>
                </div>

                {/* Skills Preview */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">React</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Node.js</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">MongoDB</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Docker</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">AWS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-60"></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
