import { motion } from 'framer-motion'
import { Target, Search, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'ATS Score',
    description: 'See how well your resume matches a job description with our intelligent scoring algorithm.',
    color: 'indigo'
  },
  {
    icon: Search,
    title: 'Skill Gap Analysis',
    description: 'Identify missing skills and keywords that recruiters expect to see in your resume.',
    color: 'purple'
  },
  {
    icon: Sparkles,
    title: 'AI Resume Suggestions',
    description: 'Improve bullet points and highlight measurable impact with AI-powered recommendations.',
    color: 'pink'
  }
]

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600'
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600'
  }
}

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Everything You Need to Land More Interviews
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI-powered tools analyze your resume against job descriptions to help you stand out to recruiters.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className={`w-14 h-14 ${colorClasses[feature.color].bg} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className={`w-7 h-7 ${colorClasses[feature.color].text}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
