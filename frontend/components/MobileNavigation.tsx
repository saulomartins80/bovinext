import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  TrendingUp, 
  Target, 
  Plane, 
  Settings, 
  Plus,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavigationProps {
  onChatToggle: () => void;
  isChatOpen: boolean;
  onSidebarToggle: () => void;
  onAddItem?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  onChatToggle, 
  isChatOpen, 
  onSidebarToggle,
  onAddItem 
}) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  const getCurrentAction = () => {
    const path = router.pathname;
    
    switch (path) {
      case '/':
      case '/dashboard':
        return 'dashboard';
      case '/transacoes':
        return 'transacoes';
      case '/investimentos':
        return 'investimentos';
      case '/metas':
        return 'metas';
      case '/milhas':
        return 'milhas';
      case '/configuracoes':
        return 'configuracoes';
      default:
        return 'dashboard';
    }
  };

  const handleCenterButtonClick = () => {
    const currentAction = getCurrentAction();
    
    // Se há um callback específico para adição, usar ele
    if (onAddItem) {
      onAddItem();
      return;
    }
    
    // Caso contrário, usar a lógica padrão baseada na página
    switch (currentAction) {
      case 'transacoes':
        router.push('/transacoes?action=new');
        break;
      case 'investimentos':
        router.push('/investimentos?action=new');
        break;
      case 'metas':
        router.push('/metas?action=new');
        break;
      case 'milhas':
        router.push('/milhas?action=new');
        break;
      default:
        // Para dashboard, abrir o menu de arco-íris
        setIsMenuOpen(!isMenuOpen);
        break;
    }
  };

  const handleMenuAction = (action: string) => {
    setIsMenuOpen(false);
    switch (action) {
      case 'transacoes':
        router.push('/transacoes?action=new');
        break;
      case 'investimentos':
        router.push('/investimentos?action=new');
        break;
      case 'metas':
        router.push('/metas?action=new');
        break;
      case 'milhas':
        router.push('/milhas?action=new');
        break;
    }
  };

  const getCenterButtonIcon = () => {
    const currentAction = getCurrentAction();
    
    // Para páginas que têm formulários de adição, mostrar o ícone de Plus
    if (['transacoes', 'investimentos', 'metas', 'milhas'].includes(currentAction)) {
      return <Plus size={24} />;
    }
    
    // Para dashboard, mostrar o ícone de menu
    return isMenuOpen ? <X size={24} /> : <Menu size={24} />;
  };

  const menuItems = [
    { action: 'transacoes', icon: <TrendingUp size={20} />, label: 'Transação', color: 'bg-blue-500' },
    { action: 'investimentos', icon: <Target size={20} />, label: 'Investimento', color: 'bg-green-500' },
    { action: 'metas', icon: <Target size={20} />, label: 'Meta', color: 'bg-purple-500' },
    { action: 'milhas', icon: <Plane size={20} />, label: 'Milhas', color: 'bg-orange-500' },
  ];

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 z-50 md:hidden ${
        resolvedTheme === 'dark' ? 'bg-gray-900 border-t border-gray-700' : 'bg-white border-t border-gray-200'
      }`}>
        <div className="flex items-center justify-around px-4 py-2">
          {/* Botão Menu (Sidebar) */}
          <button
            onClick={onSidebarToggle}
            className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu size={20} />
            <span className="text-xs mt-1">Menu</span>
          </button>

          {/* Botão Investimentos */}
          <button
            onClick={() => router.push('/investimentos')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isActive('/investimentos') 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Target size={20} />
            <span className="text-xs mt-1">Investimentos</span>
          </button>

          {/* Botão Central */}
          <button
            onClick={handleCenterButtonClick}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all transform hover:scale-105 ${
              resolvedTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {getCenterButtonIcon()}
          </button>

          {/* Botão Metas */}
          <button
            onClick={() => router.push('/metas')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isActive('/metas') 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Target size={20} />
            <span className="text-xs mt-1">Metas</span>
          </button>

          {/* Botão Chat */}
          <button
            onClick={onChatToggle}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
              isChatOpen 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-xs mt-1">Chat</span>
          </button>
        </div>
      </div>

      {/* Menu de Arco-íris */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                {/* Botão Central */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${
                    resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } text-gray-600 dark:text-gray-300`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                >
                  <X size={24} />
                </motion.button>

                {/* Itens do Menu em Arco */}
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.action}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{ 
                      scale: 1, 
                      x: Math.cos((index * 90 - 45) * Math.PI / 180) * 80,
                      y: Math.sin((index * 90 - 45) * Math.PI / 180) * 80
                    }}
                    exit={{ scale: 0, x: 0, y: 0 }}
                    transition={{ 
                      delay: 0.1 + index * 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    className={`absolute w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white ${item.color} hover:scale-110 transition-transform`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuAction(item.action);
                    }}
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {item.icon}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;