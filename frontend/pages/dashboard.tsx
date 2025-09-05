import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardContent from '../components/DashboardContent';
import styles from './Dashboard.module.css';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, authChecked } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  // Check for welcome parameter
  useEffect(() => {
    if (router.isReady && router.query.welcome === 'true') {
      setShowWelcome(true);
      // Remove the welcome parameter from URL
      router.replace('/dashboard', undefined, { shallow: true });
    }
  }, [router.isReady, router.query.welcome, router]);

  // Estados de carregamento
  if (loading || !authChecked) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  // Se não há usuário, mostra uma mensagem em vez de redirecionar
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acesso Restrito
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Você precisa estar logado para acessar o dashboard.
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Welcome Message Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowWelcome(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto text-center border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <FiCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Bem-vindo ao Finnextho!
              </h2>
              
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Sua conta foi criada com sucesso. Agora você pode começar a gerenciar suas finanças de forma profissional e inteligente.
              </p>
              
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Dashboard personalizado configurado</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Sistema de armazenamento ativado</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <FiCheck className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  <span>Perfil pronto para personalização</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowWelcome(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Começar a usar
              </button>
              
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </>
  );
}

// Componente de Layout separado com props opcionais
function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}