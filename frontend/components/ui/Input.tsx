// components/ui/Input.tsx
import React, { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  showPasswordToggle?: boolean;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  hint,
  icon,
  variant = 'outlined',
  size = 'md',
  showPasswordToggle = false,
  loading = false,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border-0 bg-gray-100 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600',
    filled: 'border-0 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700',
    outlined: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
  };

  const getStateClasses = () => {
    if (error) {
      return 'border-red-500 focus:border-red-500 focus:ring-red-500/20';
    }
    if (success) {
      return 'border-green-500 focus:border-green-500 focus:ring-green-500/20';
    }
    if (isFocused) {
      return 'border-blue-500 focus:border-blue-500 focus:ring-blue-500/20';
    }
    return 'focus:border-blue-500 focus:ring-blue-500/20';
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full rounded-lg transition-all duration-200 ease-in-out
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${getStateClasses()}
            ${icon ? 'pl-10' : ''}
            ${showPasswordToggle || success || error ? 'pr-10' : ''}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={loading || props.disabled}
          {...props}
        />

        {/* Password Toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}

        {/* Status Icons */}
        {!showPasswordToggle && (error || success) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error && <FiAlertCircle className="text-red-500" size={18} />}
            {success && <FiCheck className="text-green-500" size={18} />}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {(error || success || hint) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <FiAlertCircle size={14} />
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <FiCheck size={14} />
                {success}
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hint}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
