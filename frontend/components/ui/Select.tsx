// components/ui/Select.tsx
import React, { forwardRef } from 'react';
import { FiChevronDown, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  loading?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  success,
  hint,
  options,
  placeholder,
  size = 'md',
  variant = 'outlined',
  loading = false,
  className = '',
  ...props
}, ref) => {
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
        <select
          ref={ref}
          className={`
            w-full rounded-lg transition-all duration-200 ease-in-out appearance-none
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${getStateClasses()}
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            pr-10
            ${className}
          `}
          disabled={loading || props.disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <FiChevronDown className="text-gray-400 dark:text-gray-500" size={18} />
          )}
        </div>

        {/* Status Icons */}
        {!loading && (error || success) && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            {error && <FiAlertCircle className="text-red-500" size={16} />}
            {success && <FiCheck className="text-green-500" size={16} />}
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

Select.displayName = 'Select';

export default Select;
