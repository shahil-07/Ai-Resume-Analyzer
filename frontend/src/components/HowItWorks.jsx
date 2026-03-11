import { motion } from 'framer-motion'
import { Upload, FileText, BarChart3, Rocket } from 'lucide-react'

const steps = [
  {
    step: 1,
    icon: Upload,
    title: 'Upload Resume',
    description: 'Upload your resume in PDF or DOCX format'
  },
  {
    step: 2,
    icon: FileText,
    title: 'Paste Job Description',
    description: 'Add the job description you want to match'
  },
  {
    step: 3,
    icon: BarChart3,
    title: 'Get ATS Score',
    description: 'Receive instant analysis and match percentage'
  },
  {
    step: 4,
    icon: Rocket,
    title: 'Improve Resume',
    description: 'Apply AI suggestions to boost your score'
  }
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Get your resume analyzed in four simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-indigo-100"></div>
              )}
              
              {/* Step Circle */}
              <div className="relative z-10 mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <item.icon className="w-8 h-8 text-white" />
              </div>
              
              {/* Step Number */}
              <div className="absolute -top-2 -right-2 md:right-auto md:left-1/2 md:ml-6 w-8 h-8 bg-white border-2 border-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 z-20">
                {item.step}
              </div>
              
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-gray-600 text-sm">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
