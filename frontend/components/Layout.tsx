import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';
import MobileNavigation from './MobileNavigation';
import { ProtectedRoute } from './ProtectedRoute';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Inicializa o Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY!);

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const MD_BREAKPOINT = 768;

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT) {
       return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  });
  const [isMobileView, setIsMobileView] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(false);
  const [addItemCallback, setAddItemCallback] = useState<(() => void) | null>(null);

  // Função para obter o título da página atual
  const getPageTitle = () => {
    const path = router.pathname;
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/transacoes':
        return 'Transações';
      case '/investimentos':
        return 'Investimentos';
      case '/metas':
        return 'Metas';
      case '/milhas':
        return 'Milhas';
      case '/profile':
        return 'Perfil';
      case '/configuracoes':
        return 'Configurações';
      default:
        return 'FinNext';
    }
  };

  // Função para lidar com o botão central da navegação móvel
  const handleAddItem = () => {
    if (addItemCallback) {
      addItemCallback();
    } else {
      // Fallback: navegar para a página com parâmetro de ação
      const currentPath = router.pathname;
      switch (currentPath) {
        case '/transacoes':
          router.push('/transacoes?action=new');
          break;
        case '/investimentos':
          router.push('/investimentos?action=new');
          break;
        case '/metas':
          router.push('/metas?action=new');
          break;
        case '/milhas':
          router.push('/milhas?action=new');
          break;
        default:
          // Para dashboard, abrir sidebar
          if (isMobileView) {
            toggleMobileSidebar();
          }
          break;
      }
    }
  };

  // Função para registrar callback de adição de item
  const registerAddItemCallback = useCallback((callback: () => void) => {
    setAddItemCallback(() => callback);
  }, []);

  // Função para remover callback de adição de item
  const unregisterAddItemCallback = useCallback(() => {
    setAddItemCallback(null);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < MD_BREAKPOINT);
    };
    checkMobile();
    const debouncedCheckMobile = debounce(checkMobile, 100);
    window.addEventListener('resize', debouncedCheckMobile);
    return () => {
      window.removeEventListener('resize', debouncedCheckMobile);
    };
  }, []);

  // Scroll listener para mostrar/ocultar header no mobile
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileView) {
        setShowMobileHeader(window.scrollY > 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileView]);

  useEffect(() => {
    if (!isMobileView && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobileView, isMobileSidebarOpen]);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  const toggleDesktopSidebarCollapse = useCallback(() => {
    setIsDesktopSidebarCollapsed(prev => !prev);
    if (typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT) {
      localStorage.setItem('sidebarCollapsed', String(!isDesktopSidebarCollapsed));
    }
  }, [isDesktopSidebarCollapsed]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  // Expor funções para as páginas filhas
  const layoutContext = {
    registerAddItemCallback,
    unregisterAddItemCallback,
    isMobileView
  };

  return (
    <ProtectedRoute>
      <Elements stripe={stripePromise}>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          {/* Sidebar para desktop */}
          {!isMobileView && (
            <Sidebar
              isMobile={false}
              initialCollapsed={isDesktopSidebarCollapsed}
              onToggle={toggleDesktopSidebarCollapse}
              isOpen={true}
              onClose={() => {}}
            />
          )}
          
          {/* Sidebar para mobile */}
          {isMobileView && (
            <Sidebar
              isOpen={isMobileSidebarOpen}
              onClose={toggleMobileSidebar}
              isMobile={true}
            />
          )}
          
          <div
            className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
              !isMobileView && isDesktopSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
            }`}
          >
            {/* Header para desktop */}
            {!isMobileView && (
              <Header
                isSidebarOpen={isMobileSidebarOpen}
                toggleMobileSidebar={toggleMobileSidebar}
              />
            )}
            
            {/* Header para mobile (aparece quando rola) */}
            {isMobileView && showMobileHeader && (
              <MobileHeader
                title={getPageTitle()}
                onMenuToggle={toggleMobileSidebar}
                showBackButton={false}
              />
            )}
            
            {/* Conteúdo principal */}
            <main className={`flex-1 overflow-y-auto ${
              isMobileView ? 'pt-4 pb-20' : 'pt-24 md:pt-20'
            } px-4 md:px-6`}>
              {children}
            </main>
          </div>
          
          {/* Chatbot */}
          <Chatbot 
            isOpen={isChatOpen}
            onToggle={toggleChat}
          />

          {/* Botão flutuante para abrir o chat */}
          {!isChatOpen && (
            <button
              className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
              onClick={() => setIsChatOpen(true)}
              aria-label="Abrir chat"
            >
              Abrir Chat
            </button>
          )}
          
          {/* Navegação móvel */}
          <MobileNavigation 
            onChatToggle={toggleChat}
            isChatOpen={isChatOpen}
            onSidebarToggle={toggleMobileSidebar}
            onAddItem={handleAddItem}
          />
        </div>
      </Elements>
    </ProtectedRoute>
  );
}