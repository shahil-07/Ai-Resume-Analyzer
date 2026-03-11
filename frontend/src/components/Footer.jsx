import { FileText, Github, Twitter, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-indigo-400" />
              <span className="text-xl font-bold text-white">ResumeAI</span>
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              AI-powered resume analyzer that helps job seekers optimize their resumes for ATS systems and land more interviews.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
              </li>
              <li>
                <Link to="/analyzer" className="hover:text-indigo-400 transition-colors">Analyzer</Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
