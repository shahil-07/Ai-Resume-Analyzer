import { motion } from 'framer-motion'

const ScoreCircle = ({ score, size = 'large' }) => {
  const sizeClasses = {
    large: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-sm' },
    medium: { container: 'w-32 h-32', text: 'text-3xl', label: 'text-xs' },
    small: { container: 'w-24 h-24', text: 'text-2xl', label: 'text-xs' }
  }

  const dimensions = {
    large: { size: 160, cx: 80, cy: 80, r: 70 },
    medium: { size: 128, cx: 64, cy: 64, r: 56 },
    small: { size: 96, cx: 48, cy: 48, r: 40 }
  }

  const dim = dimensions[size]
  const circumference = 2 * Math.PI * dim.r
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreColor = (score) => {
    if (score >= 75) return { stroke: '#22c55e', bg: 'text-green-500', label: 'Excellent' }
    if (score >= 50) return { stroke: '#f59e0b', bg: 'text-amber-500', label: 'Good' }
    return { stroke: '#ef4444', bg: 'text-red-500', label: 'Needs Work' }
  }

  const scoreInfo = getScoreColor(score)

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size].container}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${dim.size} ${dim.size}`}>
          {/* Background circle */}
          <circle
            cx={dim.cx}
            cy={dim.cy}
            r={dim.r}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={dim.cx}
            cy={dim.cy}
            r={dim.r}
            stroke={scoreInfo.stroke}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className={`${sizeClasses[size].text} font-bold text-gray-900`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <motion.span 
        className={`mt-2 ${sizeClasses[size].label} font-medium ${scoreInfo.bg}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {scoreInfo.label}
      </motion.span>
    </div>
  )
}

export default ScoreCircle
