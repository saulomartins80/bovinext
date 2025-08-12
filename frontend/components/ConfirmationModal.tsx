import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  confirmColor?: 'red' | 'blue' | 'green';
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmText = 'Confirmar',
  confirmColor = 'red',
  icon
}) => {
  const { resolvedTheme } = useTheme();

  const getThemeClasses = () => {
    const isDark = resolvedTheme === 'dark';
    
    return {
      cardBg: isDark ? 'bg-gray-800' : 'bg-white',
      text: isDark ? 'text-gray-100' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    };
  };

  const themeClasses = getThemeClasses();

  const getConfirmButtonClasses = () => {
    switch (confirmColor) {
      case 'blue':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';
      case 'green':
        return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800';
      default:
        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';
    }
  };

  const getIconBgClasses = () => {
    switch (confirmColor) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/20';
      default:
        return 'bg-red-100 dark:bg-red-900/20';
    }
  };

  const getIconColorClasses = () => {
    switch (confirmColor) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      default:
        return 'text-red-600';
    }
  };

  const defaultIcon = (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={getIconColorClasses()}>
      <polyline points="3,6 5,6 21,6" />
      <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`${themeClasses.cardBg} rounded-3xl shadow-2xl w-full max-w-md p-6 border ${themeClasses.border}`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                {title}
              </h2>
              <button 
                onClick={onClose}
                className={`p-2 rounded-lg ${themeClasses.hover} transition-colors`}
              >
                <X size={20} className={themeClasses.text} />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              {/* Icon */}
              <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 ${getIconBgClasses()} rounded-full`}>
                {icon || defaultIcon}
              </div>
              
              {/* Message */}
              <div className="text-center">
                <p className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                  Tem certeza?
                </p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {message}
                  {itemName && (
                    <>
                      {' '}<strong>{itemName}</strong>. Esta ação não pode ser desfeita.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 py-3 px-4 rounded-xl border ${themeClasses.border} ${themeClasses.text} font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-3 px-4 ${getConfirmButtonClasses()} text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2`}
              >
                {confirmColor === 'red' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                  </svg>
                )}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
