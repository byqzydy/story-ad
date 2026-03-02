import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: 'text-amber-400',
      button: 'bg-amber-500 hover:bg-amber-600'
    },
    info: {
      bg: 'bg-ambient-blue/10',
      border: 'border-ambient-blue/30',
      icon: 'text-ambient-blue',
      button: 'bg-ambient-blue hover:bg-ambient-purple'
    }
  }

  const style = variantStyles[variant]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-luxury-950 border border-glass-border rounded-2xl p-6 shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 ${style.bg} rounded-full flex items-center justify-center`}>
                  <AlertTriangle className={`w-8 h-8 ${style.icon}`} />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-white text-center mb-2">
                {title}
              </h3>
              
              {/* Message */}
              <p className="text-sm text-luxury-400 text-center mb-6">
                {message}
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 bg-luxury-700 text-white rounded-xl hover:bg-luxury-600 transition-colors font-medium"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2.5 ${style.button} text-white rounded-xl transition-colors font-medium`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }>({
    title: '',
    message: '',
    onConfirm: () => {}
  })

  const confirm = (options: {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }) => {
    setConfig(options)
    setIsOpen(true)
  }

  const handleConfirm = () => {
    config.onConfirm()
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    confirm,
    Dialog: (
      <ConfirmDialog
        isOpen={isOpen}
        title={config.title}
        message={config.message}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )
  }
}
