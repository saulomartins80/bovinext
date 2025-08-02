import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Custom hook para melhor tratamento do i18next com fallbacks
 */
export const useI18n = (namespace: string = 'common') => {
  const { t, i18n, ready } = useTranslation(namespace);

  const translate = useCallback((key: string, fallback?: string, options?: Record<string, unknown>): string => {
    try {
      if (!ready) {
        return fallback || key;
      }
      
      const translation = t(key, options);
      
      // Se a tradução não existir ou for igual à chave, usar fallback
      if (!translation || translation === key) {
        return fallback || key;
      }
      
      // Garantir que sempre retorne uma string
      return String(translation);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return fallback || key;
    }
  }, [t, ready]);

  const changeLanguage = useCallback((lng: string) => {
    try {
      return i18n.changeLanguage(lng);
    } catch (error) {
      console.error('Error changing language:', error);
      return Promise.reject(error);
    }
  }, [i18n]);

  return {
    t: translate,
    changeLanguage,
    currentLanguage: i18n.language,
    ready,
    isLoading: !ready,
  };
};

export default useI18n;
