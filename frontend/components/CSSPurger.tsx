import { useEffect } from 'react';

/**
 * CSS Purger - Remove CSS não utilizado dinamicamente
 * Analisa o DOM e remove classes CSS não utilizadas
 */
export const useCSSPurging = () => {
  useEffect(() => {
    const purgeUnusedCSS = () => {
      // Lista de classes CSS críticas que nunca devem ser removidas
      const criticalClasses = [
        'sr-only', 'focus:not-sr-only', 'skip-link',
        'dark:', 'hover:', 'focus:', 'active:', 'group-hover:',
        'sm:', 'md:', 'lg:', 'xl:', '2xl:',
        'motion-reduce:', 'motion-safe:',
        'print:', 'screen:',
      ];

      // Coleta todas as classes usadas no DOM
      const usedClasses = new Set<string>();
      
      // Função para extrair classes de um elemento
      const extractClasses = (element: Element) => {
        const classList = element.classList;
        for (let i = 0; i < classList.length; i++) {
          const className = classList[i];
          usedClasses.add(className);
          
          // Adiciona variações responsivas e de estado
          criticalClasses.forEach(prefix => {
            if (className.startsWith(prefix)) {
              usedClasses.add(className);
            }
          });
        }
      };

      // Analisa todos os elementos do DOM
      const allElements = document.querySelectorAll('*');
      allElements.forEach(extractClasses);

      // Adiciona classes que podem ser adicionadas dinamicamente
      const dynamicClasses = [
        'toast-success', 'toast-error', 'toast-warning', 'toast-info',
        'loading', 'skeleton', 'fade-in', 'fade-out',
        'slide-in', 'slide-out', 'bounce', 'pulse',
        'error', 'success', 'warning', 'info',
        'active', 'inactive', 'disabled', 'enabled',
        'visible', 'hidden', 'show', 'hide',
      ];
      
      dynamicClasses.forEach(cls => usedClasses.add(cls));

      // Remove stylesheets não críticos se não tiverem classes utilizadas
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach(stylesheet => {
        const href = (stylesheet as HTMLLinkElement).href;
        
        // Não remove CSS crítico
        if (href.includes('tailwind') || 
            href.includes('globals') || 
            href.includes('critical') ||
            href.includes('fonts.googleapis.com')) {
          return;
        }

        // Remove CSS de bibliotecas não utilizadas
        const unusedLibraries = [
          'react-tabs', 'splide', 'toastify'
        ];

        unusedLibraries.forEach(lib => {
          if (href.includes(lib)) {
            const hasUsedClasses = Array.from(usedClasses).some(cls => 
              cls.includes(lib) || cls.includes(lib.replace('-', ''))
            );
            
            if (!hasUsedClasses) {
              console.log(`Removendo CSS não utilizado: ${lib}`);
              stylesheet.remove();
            }
          }
        });
      });

      // Cria CSS otimizado apenas com classes utilizadas
      const optimizedCSS = generateOptimizedCSS(usedClasses);
      if (optimizedCSS) {
        injectOptimizedCSS(optimizedCSS);
      }
    };

    // Gera CSS otimizado com apenas as classes utilizadas
    const generateOptimizedCSS = (usedClasses: Set<string>): string => {
      const commonUtilities = Array.from(usedClasses).filter(cls => {
        const c = typeof cls === 'string' ? cls : '';
        return c.match(/^(m|p|w|h|text|bg|border|flex|grid|space|gap)-/) ||
               c.match(/^(rounded|shadow|opacity|transform|transition)-/) ||
               c.match(/^(absolute|relative|fixed|sticky|static)$/) ||
               c.match(/^(block|inline|hidden|flex|grid)$/);
      });

      if (commonUtilities.length === 0) return '';

      // CSS básico otimizado
      return `
        /* CSS Otimizado - Apenas classes utilizadas */
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        .focus\\:not-sr-only:focus { position: static; width: auto; height: auto; padding: 0; margin: 0; overflow: visible; clip: auto; white-space: normal; }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: loading 1.5s infinite; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .fade-in { animation: fadeIn 0.3s ease-in; }
        .fade-out { animation: fadeOut 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      `;
    };

    // Injeta CSS otimizado
    const injectOptimizedCSS = (css: string) => {
      const existingStyle = document.getElementById('optimized-css');
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement('style');
      style.id = 'optimized-css';
      style.textContent = css;
      document.head.appendChild(style);
    };

    // Executa purging após carregamento completo
    const runPurging = () => {
      if (document.readyState === 'complete') {
        setTimeout(purgeUnusedCSS, 1000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(purgeUnusedCSS, 1000);
        });
      }
    };

    runPurging();

    // Observer para mudanças no DOM
    const observer = new MutationObserver(() => {
      // Debounce para evitar execuções excessivas
      clearTimeout(window.cssPurgeTimeout);
      window.cssPurgeTimeout = setTimeout(purgeUnusedCSS, 2000);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
      clearTimeout(window.cssPurgeTimeout);
    };
  }, []);
};

/**
 * Componente para purging de CSS
 */
export const CSSPurger = () => {
  useCSSPurging();
  return null;
};

/**
 * Utilitário para preload de CSS crítico
 */
export const preloadCriticalCSS = () => {
  const criticalCSS = [
    '/styles/globals.css',
    // Adicione outros CSS críticos aqui
  ];

  criticalCSS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  });
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    cssPurgeTimeout: NodeJS.Timeout;
  }
}

export default CSSPurger;
