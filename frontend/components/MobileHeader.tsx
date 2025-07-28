import React from 'react';
import { useRouter } from 'next/router';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface MobileHeaderProps {
  title: string;
  onMenuToggle?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  title, 
  onMenuToggle, 
  showBackButton = false,
  onBack 
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <motion.header 
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 md:hidden ${
        resolvedTheme === 'dark' 
          ? 'bg-gray-900/95 border-b border-gray-800/50' 
          : 'bg-white/95 border-b border-gray-200/50'
      } backdrop-blur-xl shadow-lg`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {/* Botão do Menu (Sidebar) */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuToggle}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
            resolvedTheme === 'dark' 
              ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/50' 
              : 'bg-gray-100/50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200/50'
          }`}
        >
          <Menu size={20} />
        </motion.button>

        {/* Título da Página */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={`text-lg font-bold truncate max-w-[60%] text-center ${
            resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {title}
        </motion.h1>

        {/* Espaço para balanceamento */}
        <div className="w-10" />
      </div>
    </motion.header>
  );
};

export default MobileHeader; 