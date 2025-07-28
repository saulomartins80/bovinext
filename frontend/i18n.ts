import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Verificar se já foi inicializado para evitar inicialização dupla
if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'pt',
      supportedLngs: ['pt', 'en', 'es'],
      debug: false, // Desabilitar debug para melhorar performance
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        crossDomain: false,
        allowMultiLoading: false,
        // Adicionar timeout para evitar travamentos
        requestOptions: {
          cache: 'default'
        }
      },
      ns: ['common'],
      defaultNS: 'common',
      react: {
        useSuspense: false,
      },
      load: 'languageOnly',
      keySeparator: '.',
      nsSeparator: ':',
      returnEmptyString: false,
      returnNull: false,
      returnObjects: false,
      // Melhorar cache e performance
      saveMissing: false,
      updateMissing: false,
      // Configurações de detecção de idioma mais eficientes
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      }
    })
    .catch((error) => {
      console.error('Erro ao inicializar i18next:', error);
    });
}

export default i18n;