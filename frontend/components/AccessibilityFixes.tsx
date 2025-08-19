import { useEffect } from 'react';

/**
 * Componente para correções de acessibilidade
 * Implementa melhorias ARIA, navegação por teclado e contraste
 */
export const AccessibilityFixes = () => {
  useEffect(() => {
    // Adiciona navegação por teclado para elementos interativos
    const addKeyboardNavigation = () => {
      const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      interactiveElements.forEach((element) => {
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', '0');
        }
        
        // Adiciona indicador visual de foco
        element.addEventListener('focus', (e) => {
          (e.target as HTMLElement).style.outline = '2px solid #3b82f6';
          (e.target as HTMLElement).style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', (e) => {
          (e.target as HTMLElement).style.outline = '';
          (e.target as HTMLElement).style.outlineOffset = '';
        });
      });
    };

    // Adiciona labels para inputs sem label
    const addMissingLabels = () => {
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      inputs.forEach((input, index) => {
        const placeholder = input.getAttribute('placeholder');
        const type = input.getAttribute('type');
        
        if (placeholder) {
          input.setAttribute('aria-label', placeholder);
        } else if (type) {
          input.setAttribute('aria-label', `Campo ${type}`);
        } else {
          input.setAttribute('aria-label', `Campo de entrada ${index + 1}`);
        }
      });
    };

    // Adiciona roles ARIA para elementos semânticos
    const addAriaRoles = () => {
      // Navegação principal
      const navs = document.querySelectorAll('nav:not([role])');
      navs.forEach(nav => nav.setAttribute('role', 'navigation'));
      
      // Botões sem role
      const buttons = document.querySelectorAll('div[onclick]:not([role]), span[onclick]:not([role])');
      buttons.forEach(button => {
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
      });
      
      // Listas
      const lists = document.querySelectorAll('ul:not([role]), ol:not([role])');
      lists.forEach(list => list.setAttribute('role', 'list'));
      
      // Items de lista
      const listItems = document.querySelectorAll('li:not([role])');
      listItems.forEach(item => item.setAttribute('role', 'listitem'));
    };

    // Melhora contraste de texto
    const improveContrast = () => {
      const lowContrastElements = document.querySelectorAll('.text-gray-400, .text-gray-500');
      lowContrastElements.forEach(element => {
        element.classList.remove('text-gray-400', 'text-gray-500');
        element.classList.add('text-gray-600');
      });
    };

    // Adiciona skip links
    const addSkipLinks = () => {
      if (!document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
        skipLink.style.cssText = `
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        `;
        
        skipLink.addEventListener('focus', () => {
          skipLink.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: auto;
            height: auto;
            overflow: visible;
            z-index: 9999;
            background: #1d4ed8;
            color: white;
            padding: 8px 16px;
            text-decoration: none;
          `;
        });
        
        skipLink.addEventListener('blur', () => {
          skipLink.style.cssText = `
            position: absolute;
            left: -10000px;
            top: auto;
            width: 1px;
            height: 1px;
            overflow: hidden;
          `;
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    };

    // Adiciona main landmark se não existir
    const addMainLandmark = () => {
      if (!document.querySelector('main')) {
        const mainContent = document.querySelector('#main-content, .main-content, [role="main"]');
        if (mainContent && mainContent.tagName !== 'MAIN') {
          const main = document.createElement('main');
          main.id = 'main-content';
          mainContent.parentNode?.insertBefore(main, mainContent);
          main.appendChild(mainContent);
        }
      }
    };

    // Executa todas as correções
    const runAccessibilityFixes = () => {
      addKeyboardNavigation();
      addMissingLabels();
      addAriaRoles();
      improveContrast();
      addSkipLinks();
      addMainLandmark();
    };

    // Executa imediatamente
    runAccessibilityFixes();

    // Executa novamente após mudanças no DOM
    const observer = new MutationObserver(() => {
      setTimeout(runAccessibilityFixes, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
};

/**
 * Hook para melhorar acessibilidade de formulários
 */
export const useFormAccessibility = () => {
  useEffect(() => {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Adiciona role form se não existir
      if (!form.hasAttribute('role')) {
        form.setAttribute('role', 'form');
      }
      
      // Adiciona aria-label se não existir
      if (!form.hasAttribute('aria-label') && !form.hasAttribute('aria-labelledby')) {
        const heading = form.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          const id = heading.id || `form-heading-${Math.random().toString(36).substr(2, 9)}`;
          heading.id = id;
          form.setAttribute('aria-labelledby', id);
        } else {
          form.setAttribute('aria-label', 'Formulário');
        }
      }
      
      // Melhora campos obrigatórios
      const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');
      requiredFields.forEach(field => {
        field.setAttribute('aria-required', 'true');
        
        // Adiciona indicador visual
        const label = form.querySelector(`label[for="${field.id}"]`);
        if (label && !label.textContent?.includes('*')) {
          label.innerHTML += ' <span aria-hidden="true" style="color: #dc2626;">*</span>';
        }
      });
      
      // Melhora mensagens de erro
      const errorMessages = form.querySelectorAll('.error, [class*="error"]');
      errorMessages.forEach((error, index) => {
        if (!error.id) {
          error.id = `error-${index}`;
        }
        error.setAttribute('role', 'alert');
        error.setAttribute('aria-live', 'polite');
      });
    });
  }, []);
};

export default AccessibilityFixes;
