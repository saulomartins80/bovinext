import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

interface UseAddItemCallbackProps {
  onAddItem: () => void;
  isMobileView?: boolean;
}

export const useAddItemCallback = ({ onAddItem, isMobileView = false }: UseAddItemCallbackProps) => {
  const router = useRouter();

  // Monitora parâmetros da URL para abrir formulário automaticamente
  useEffect(() => {
    if (router.query.action === 'new') {
      onAddItem();
      // Remove o parâmetro da URL para não abrir novamente ao recarregar
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router, onAddItem]);

  // Função para abrir o formulário programaticamente
  const openAddForm = useCallback(() => {
    if (isMobileView) {
      // No mobile, usar o callback direto
      onAddItem();
    } else {
      // No desktop, adicionar parâmetro na URL
      router.push(`${router.pathname}?action=new`);
    }
  }, [onAddItem, isMobileView, router]);

  return { openAddForm };
}; 