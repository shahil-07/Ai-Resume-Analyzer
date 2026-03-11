import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FileUpload = ({ onFileSelect, file, onClear, uploading = false, uploadProgress = 0 }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading
  })

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`} />
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              or click to browse
            </p>
            <p className="mt-4 text-xs text-gray-400">
              Supports PDF and DOCX (max 5MB)
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`border-2 rounded-xl p-6 ${
              uploading 
                ? 'border-indigo-200 bg-indigo-50' 
                : 'border-green-200 bg-green-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  uploading ? 'bg-indigo-100' : 'bg-green-100'
                }`}>
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  ) : (
                    <FileText className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {!uploading && <CheckCircle className="w-6 h-6 text-green-500" />}
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onClear()
                    }}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Upload Progress Bar */}
            {uploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <div className="flex justify-between text-sm text-indigo-600 mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-indigo-600 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload
