import { motion } from 'framer-motion'
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const SkillsDisplay = ({ matchedSkills = [], missingSkills = [] }) => {
  const totalRequired = matchedSkills.length + missingSkills.length
  const matchPercentage = totalRequired > 0 
    ? Math.round((matchedSkills.length / totalRequired) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Skills Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Skills Match Rate</p>
              <p className="text-2xl font-bold text-indigo-600">{matchPercentage}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-green-600">{matchedSkills.length}</span> matched
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-red-600">{missingSkills.length}</span> missing
            </p>
          </div>
        </div>
      </motion.div>

      {/* Matched Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h4 className="font-semibold text-gray-900">Matched Skills ({matchedSkills.length})</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {matchedSkills.length > 0 ? (
            matchedSkills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium"
              >
                {skill}
              </motion.span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No matching skills found</span>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <h4 className="font-semibold text-gray-900">Missing Skills ({missingSkills.length})</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {missingSkills.length > 0 ? (
            missingSkills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium"
              >
                {skill}
              </motion.span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No missing skills detected</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default SkillsDisplay
