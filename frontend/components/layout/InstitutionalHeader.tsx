import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { 
  FiHome, 
  FiSun, 
  FiMoon
} from 'react-icons/fi';

interface InstitutionalHeaderProps {
  title: string;
  icon?: React.ReactNode;
  breadcrumb?: string;
}

export const InstitutionalHeader: React.FC<InstitutionalHeaderProps> = ({ 
  title, 
  icon, 
  breadcrumb
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <motion.header 
      className={`sticky top-0 z-50 ${
        resolvedTheme === 'dark' 
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800' 
          : 'bg-white/95 backdrop-blur-xl border-b border-gray-200'
      } shadow-lg`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra Superior com Logo e Ações */}
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
            <Image src="/finnextho.png" alt="finnextho" width={32} height={32} className="md:w-10 md:h-10" />
            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              fin<span className="text-blue-300">nextho</span>
            </span>
          </Link>

          {/* Ações Simples */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Toggle Theme */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 md:p-2 rounded-lg transition-colors ${
                resolvedTheme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label={resolvedTheme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {resolvedTheme === 'dark' ? <FiSun className="w-4 h-4 md:w-5 md:h-5" /> : <FiMoon className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Botão Principal */}
            <Link
              href="/auth/register"
              className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-xs md:text-sm"
            >
              Começar Agora
            </Link>
          </div>
        </div>

        {/* Navegação e Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-2 md:py-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2 md:space-y-0">
          {/* Navegação de Volta */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link 
              href="/"
              className={`inline-flex items-center px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105 ${
                resolvedTheme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FiHome className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              Início
            </Link>
            
            {breadcrumb && (
              <>
                <span className={resolvedTheme === 'dark' ? 'text-gray-600' : 'text-gray-400'}>/</span>
                <span className={`text-xs md:text-sm font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {breadcrumb}
                </span>
              </>
            )}
          </div>

          {/* Título da Página */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {icon && (
              <div className={`p-1.5 md:p-2 rounded-lg ${
                resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                {icon}
              </div>
            )}
            <h1 className={`text-lg md:text-xl font-bold ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h1>
          </div>
        </div>

        {/* Menu de Navegação Rápida (apenas em desktop) */}
        <div className="hidden lg:flex items-center space-x-1 py-2">
          {[
            { name: 'Recursos', path: '/recursos' },
            { name: 'Soluções', path: '/solucoes' },
            { name: 'Preços', path: '/precos' },
            { name: 'Clientes', path: '/clientes' },
            { name: 'Contato', path: '/contato' },
            { name: 'Suporte', path: '/suporte' }
          ].filter(item => item.path !== router.pathname).map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 hover:scale-105 ${
                resolvedTheme === 'dark' 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </motion.header>
  );
};