import { useEffect } from 'react';

/**
 * CSS crítico inline para melhorar FCP
 * Contém apenas os estilos essenciais para above-the-fold
 */
export const CriticalCSS = () => {
  return (
    <style>{`
      /* Reset básico */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* Fonte system fallback */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        line-height: 1.6;
        color: #374151;
        background-color: #f9fafb;
      }
      
      /* Header crítico */
      .critical-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(229, 231, 235, 0.8);
      }
      
      /* Hero section crítico */
      .critical-hero {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
        padding: 2rem 1rem;
      }
      
      .critical-hero h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        line-height: 1.2;
      }
      
      .critical-hero p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }
      
      /* Botão CTA crítico */
      .critical-cta {
        display: inline-block;
        padding: 1rem 2rem;
        background: #10b981;
        color: white;
        text-decoration: none;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: background-color 0.2s;
      }
      
      .critical-cta:hover {
        background: #059669;
      }
      
      /* Loading skeleton */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .critical-hero h1 {
          font-size: 2rem;
        }
        
        .critical-hero p {
          font-size: 1.1rem;
        }
      }
    `}</style>
  );
};

/**
 * Hook para carregar CSS não crítico após o carregamento inicial
 */
export const useNonCriticalCSS = () => {
  useEffect(() => {
    const loadNonCriticalCSS = () => {
      // Carrega Tailwind CSS após a interação
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/tailwind-output.css';
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      document.head.appendChild(link);
    };

    // Carrega CSS não crítico após primeira interação
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    const handleInteraction = () => {
      loadNonCriticalCSS();
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { 
        once: true, 
        passive: true 
      });
    });

    // Fallback: carrega após 3 segundos
    const timeout = setTimeout(loadNonCriticalCSS, 3000);

    return () => {
      clearTimeout(timeout);
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, []);
};

export default CriticalCSS;
