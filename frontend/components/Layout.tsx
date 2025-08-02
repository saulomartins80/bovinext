import { useState, useEffect, useCallback, createContext, useContext } from 'react';
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

const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const MD_BREAKPOINT = 768;

// Context para compartilhar funções entre Layout e páginas
interface LayoutContextType {
  registerAddItemCallback: (callback: () => void) => void;
  unregisterAddItemCallback: () => void;
  registerExportPDFCallback: (callback: () => void) => void;
  unregisterExportPDFCallback: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayoutContext = (): LayoutContextType => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within Layout');
  }
  return context;
};

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
  const [exportPDFCallback, setExportPDFCallback] = useState<(() => void) | null>(null);

  // Função para obter o título da página atual
  const getPageTitle = (): string => {
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
  const handleAddItem = (): void => {
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

  // Função para lidar com exportar PDF
  const handleExportPDF = (): void => {
    if (exportPDFCallback) {
      exportPDFCallback();
    }
  };

  // Função para registrar callback de adição de item
  const registerAddItemCallback = useCallback((callback: () => void): void => {
    setAddItemCallback(() => callback);
  }, []);

  // Função para remover callback de adição de item
  const unregisterAddItemCallback = useCallback(() => {
    setAddItemCallback(null);
  }, []);

  // Função para registrar callback de exportar PDF
  const registerExportPDFCallback = useCallback((callback: () => void): void => {
    setExportPDFCallback(() => callback);
  }, []);

  // Função para remover callback de exportar PDF
  const unregisterExportPDFCallback = useCallback(() => {
    setExportPDFCallback(null);
  }, []);

  useEffect(() => {
  const checkMobile = (): void => {
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
    let lastScrollY = 0;
    let ticking = false;

  const handleScroll = (): void => {
    if (!ticking && isMobileView) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        // Mostrar header se rolou para baixo mais de 100px
        // Ocultar se rolou para cima ou está no topo
        if (currentScrollY > 100 && currentScrollY > lastScrollY) {
          setShowMobileHeader(true);
        } else if (currentScrollY < lastScrollY - 10 || currentScrollY < 50) {
          setShowMobileHeader(false);
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  };

    if (isMobileView) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      setShowMobileHeader(false);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobileView]);

  useEffect(() => {
    if (!isMobileView && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [isMobileView, isMobileSidebarOpen]);

  // Limpar callbacks quando mudar de página
  useEffect(() => {
    setAddItemCallback(null);
    setExportPDFCallback(null);
  }, [router.pathname]);

  const toggleMobileSidebar = useCallback((): void => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  const toggleDesktopSidebarCollapse = useCallback((): void => {
    setIsDesktopSidebarCollapsed(prev => !prev);
    if (typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT) {
      localStorage.setItem('sidebarCollapsed', String(!isDesktopSidebarCollapsed));
    }
  }, [isDesktopSidebarCollapsed]);

  const toggleChat = useCallback((): void => {
    setIsChatOpen(prev => !prev);
  }, []);

  // Context para as páginas
  const layoutContext: LayoutContextType = {
    registerAddItemCallback,
    unregisterAddItemCallback,
    registerExportPDFCallback,
    unregisterExportPDFCallback,
  };

  return (
    <LayoutContext.Provider value={layoutContext}>
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
                onClose={(): void => {}}
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
                isMobileView 
                  ? showMobileHeader 
                    ? 'pt-20 pb-24' 
                    : 'pt-4 pb-24'
                  : 'pt-24 md:pt-20'
              } px-4 md:px-6`}>
                {children}
              </main>
            </div>
            
            {/* Navegação Mobile */}
            {isMobileView && (
              <MobileNavigation
                onChatToggle={toggleChat}
                isChatOpen={isChatOpen}
                onSidebarToggle={toggleMobileSidebar}
                onAddItem={handleAddItem}
                onExportPDF={handleExportPDF}
              />
            )}
            
            {/* Chatbot - sempre no canto direito */}
            <Chatbot 
              isOpen={isChatOpen}
              onToggle={toggleChat}
            />
          </div>
        </Elements>
      </ProtectedRoute>
    </LayoutContext.Provider>
  );
}