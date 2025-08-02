// components/ui/Toggle.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  variant = 'default',
  loading = false
}) => {
  const sizeConfig = {
    sm: {
      switch: 'h-5 w-9',
      thumb: 'h-4 w-4',
      translate: 'translate-x-4'
    },
    md: {
      switch: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: 'translate-x-5'
    },
    lg: {
      switch: 'h-7 w-13',
      thumb: 'h-6 w-6',
      translate: 'translate-x-6'
    }
  };

  const variantConfig = {
    default: {
      active: 'bg-blue-600',
      inactive: 'bg-gray-200 dark:bg-gray-600'
    },
    success: {
      active: 'bg-green-600',
      inactive: 'bg-gray-200 dark:bg-gray-600'
    },
    warning: {
      active: 'bg-yellow-600',
      inactive: 'bg-gray-200 dark:bg-gray-600'
    },
    danger: {
      active: 'bg-red-600',
      inactive: 'bg-gray-200 dark:bg-gray-600'
    }
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  const handleToggle = () => {
    if (!disabled && !loading) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`
          relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${config.switch}
          ${checked ? colors.active : colors.inactive}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle switch'}
      >
        <motion.span
          className={`
            inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${config.thumb}
            ${checked ? config.translate : 'translate-x-0'}
          `}
          layout
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-blue-600"></div>
            </div>
          )}
        </motion.span>
      </button>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label 
              className={`
                block text-sm font-medium text-gray-900 dark:text-white
                ${disabled ? 'opacity-50' : 'cursor-pointer'}
              `}
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={`
              text-sm text-gray-500 dark:text-gray-400 mt-1
              ${disabled ? 'opacity-50' : ''}
            `}>
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;
