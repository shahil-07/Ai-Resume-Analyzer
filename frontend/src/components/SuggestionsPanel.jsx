import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ArrowRight, Copy, Check, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

const SuggestionCard = ({ original, suggestion, issues = [], index }) => {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const issueLabels = {
    'no_metrics': 'Missing metrics/numbers',
    'passive_voice': 'Passive voice detected',
    'vague_language': 'Vague language used',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        aria-expanded={expanded}
        aria-label={`Suggestion for: ${original.slice(0, 50)}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-gray-900 line-clamp-1">{original.slice(0, 60)}...</p>
            <div className="flex gap-2 mt-1">
              {issues.slice(0, 2).map((issue, i) => {
                const label = issue.startsWith('weak_verb:') 
                  ? `Weak verb: "${issue.split(':')[1]}"` 
                  : issueLabels[issue] || issue
                return (
                  <span key={i} className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
        )}
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="p-5 space-y-4">
              {/* Original */}
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original</span>
                <p className="mt-1 text-gray-600 line-through decoration-red-300">{original}</p>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-indigo-400" aria-hidden="true" />
              </div>

              {/* Suggestion */}
              <div>
                <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Improved</span>
                <p className="mt-1 text-gray-900 font-medium">{suggestion}</p>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                aria-label="Copy suggestion to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    Copy suggestion
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const SuggestionsPanel = ({ suggestions = [] }) => {
  return (
    <div className="space-y-4" role="region" aria-label="AI Suggestions">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" aria-hidden="true" />
        <h4 className="font-semibold text-gray-900">AI Suggestions</h4>
        {suggestions.length > 0 && (
          <span className="text-sm text-gray-500">({suggestions.length} improvements)</span>
        )}
      </div>

      {suggestions.length > 0 ? (
        <div className="space-y-3">
          {suggestions.map((item, index) => (
            <SuggestionCard
              key={index}
              original={item.original}
              suggestion={item.suggestion}
              issues={item.issues || []}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" aria-hidden="true" />
          <p>No suggestions available</p>
          <p className="text-sm mt-1">Your resume looks good!</p>
        </div>
      )}
    </div>
  )
}

export default SuggestionsPanel
