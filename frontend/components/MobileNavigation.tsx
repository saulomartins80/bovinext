import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  TrendingUp, 
  Target, 
  Plane, 
  Plus,
  Menu,
  X,
  Download,
  BarChart2,
  DollarSign
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileNavigationProps {
  onSidebarToggle: () => void;
  onAddItem?: () => void;
  onExportPDF?: () => void;
}

interface NavigationItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  type?: string;
  action?: () => void;
}

interface PageAction {
  type: 'add' | 'export' | 'menu';
  icon: React.ReactNode;
  label: string;
  color: string;
  action: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  onSidebarToggle,
  onAddItem,
  onExportPDF
}) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  // Função para obter as ações específicas da página atual
  const getCurrentPageActions = (): PageAction[] => {
    const path = router.pathname;
    
    switch (path) {
      case '/transacoes':
        return [
          {
            type: 'add',
            icon: <Plus size={20} />,
            label: 'Nova Transação',
            color: 'bg-blue-500',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            }
          },
          {
            type: 'export',
            icon: <Download size={20} />,
            label: 'Exportar PDF',
            color: 'bg-green-500',
            action: () => {
              onExportPDF?.();
              setIsActionMenuOpen(false);
            }
          }
        ];
      
      case '/investimentos':
        return [
          {
            type: 'add',
            icon: <Plus size={20} />,
            label: 'Investimento',
            color: 'bg-green-500',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            }
          }
        ];
      
      case '/metas':
        return [
          {
            type: 'add',
            icon: <Plus size={20} />,
            label: 'Meta',
            color: 'bg-purple-500',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            }
          }
        ];
      
      case '/milhas':
        return [
          {
            type: 'add',
            icon: <Plane size={20} />,
            label: 'Milhas',
            color: 'bg-orange-500',
            action: () => {
              onAddItem?.();
              setIsActionMenuOpen(false);
            }
          }
        ];
      
      default:
        return [
          {
            type: 'add',
            icon: <Plus size={20} />,
            label: 'Transação',
            color: 'bg-blue-500',
            action: () => {
              router.push('/transacoes?action=new');
              setIsActionMenuOpen(false);
            }
          },
          {
            type: 'add',
            icon: <Target size={20} />,
            label: 'Meta',
            color: 'bg-purple-500',
            action: () => {
              router.push('/metas?action=new');
              setIsActionMenuOpen(false);
            }
          },
          {
            type: 'add',
            icon: <TrendingUp size={20} />,
            label: 'Investimento',
            color: 'bg-green-500',
            action: () => {
              router.push('/investimentos?action=new');
              setIsActionMenuOpen(false);
            }
          },
          {
            type: 'add',
            icon: <Plane size={20} />,
            label: 'Milhas',
            color: 'bg-orange-500',
            action: () => {
              router.push('/milhas?action=new');
              setIsActionMenuOpen(false);
            }
          }
        ];
    }
  };


  // Lidar com o clique do botão central
  const handleCenterButtonClick = () => {
    const actions = getCurrentPageActions();
    
    if (actions.length === 1) {
      // Se há apenas uma ação, executar diretamente
      actions[0].action();
    } else {
      // Se há múltiplas ações, abrir/fechar menu
      setIsActionMenuOpen(!isActionMenuOpen);
    }
  };

  // Fechar menu quando mudar de página
  useEffect(() => {
    setIsActionMenuOpen(false);
  }, [router.pathname]);

  // Menu principal de navegação
  const navigationItems: NavigationItem[] = [
    {
      path: '/transacoes',
      icon: <BarChart2 size={20} />,
      label: 'Transações',
      color: 'text-blue-500'
    },
    {
      path: '',
      type: 'add-button',
      icon: <Plus size={20} />,
      label: '+',
      color: 'text-white',
      action: handleCenterButtonClick
    },
    {
      path: '/investimentos',
      icon: <DollarSign size={20} />,
      label: 'Investimentos',
      color: 'text-green-500'
    },
    {
      path: '/metas',
      icon: <Target size={20} />,
      label: 'Metas',
      color: 'text-purple-500'
    }
  ];

  return (
    <>
      {/* Barra de Navegação Principal */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden ${
          resolvedTheme === 'dark' 
            ? 'bg-gray-900/95 border-t border-gray-800/50' 
            : 'bg-white/95 border-t border-gray-200/50'
        } backdrop-blur-xl shadow-2xl`}
      >
        <div className="relative flex items-center justify-around px-4 py-3">
          {/* Botão Menu (Sidebar) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSidebarToggle}
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
              resolvedTheme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            <Menu size={20} />
            <span className="text-xs mt-1 font-medium">Menu</span>
          </motion.button>

          {/* Navegação Principal */}
          {navigationItems.map((item, index) => {
            if (item.type === 'add-button') {
              return (
                <motion.button
                  key={`add-button-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.action}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    resolvedTheme === 'dark' 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
                  } text-white shadow-lg`}
                >
                  <motion.div
                    animate={{ rotate: isActionMenuOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isActionMenuOpen ? <X size={20} /> : <Plus size={20} />}
                  </motion.div>
                  {getCurrentPageActions().length > 1 && !isActionMenuOpen && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"
                    />
                  )}
                </motion.button>
              );
            }
            
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => item.path && router.push(item.path)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  item.path && isActive(item.path)
                    ? resolvedTheme === 'dark'
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-blue-600 bg-blue-50'
                    : resolvedTheme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </motion.button>
            );
          })}

          {/* Chat button removido do cabeçalho móvel (não é mais necessário) */}
        </div>
      </motion.div>

      {/* Menu de Ações em Leque */}
      <AnimatePresence>
        {isActionMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsActionMenuOpen(false)}
          >
            <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 -translate-x-8">
              <div className="relative">
                {/* Botões de Ação em Arco */}
                {getCurrentPageActions().map((action, index) => {
                  // Criar arco-íris acima do botão (180° para cima)
                  const totalActions = getCurrentPageActions().length;
                  const angleSpread = Math.PI; // 180 graus
                  const startAngle = Math.PI; // Começar em 180° (esquerda)
                  const angle = startAngle + (index * angleSpread) / (totalActions - 1 || 1);
                  const radius = 70;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <motion.button
                      key={`${action.label}-${index}`}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        scale: 1, 
                        x: x,
                        y: y
                      }}
                      exit={{ scale: 0, x: 0, y: 0 }}
                      transition={{ 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      className={`absolute w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-110 ${action.color}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.action();
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      {action.icon}
                    </motion.button>
                  );
                })}

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;