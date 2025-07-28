import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiDatabase, 
  FiSettings, 
  FiShield, 
  FiEye, 
  FiTarget,
  FiBarChart,
  FiCheckCircle,
  FiX,
  FiInfo,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiRefreshCw
} from 'react-icons/fi';
import { useState } from 'react';

export default function Cookies() {
  const { resolvedTheme } = useTheme();
  const [cookiePreferences, setCookiePreferences] = useState({
    essenciais: true, // Sempre true, não pode ser desabilitado
    analiticos: true,
    funcionais: true,
    marketing: false
  });
  const [showBanner, setShowBanner] = useState(true);

  const handlePreferenceChange = (type: string) => {
    if (type === 'essenciais') return; // Não pode ser alterado
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };

  const handleSavePreferences = () => {
    // Aqui seria implementada a lógica de salvar as preferências
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Preferências de cookies salvas com sucesso!');
  };

  const handleAcceptAll = () => {
    setCookiePreferences({
      essenciais: true,
      analiticos: true,
      funcionais: true,
      marketing: true
    });
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    setCookiePreferences({
      essenciais: true,
      analiticos: false,
      funcionais: false,
      marketing: false
    });
    setShowBanner(false);
  };

  const cookieTypes = [
    {
      id: 'essenciais',
      title: 'Cookies Essenciais',
      icon: FiShield,
      description: 'Necessários para o funcionamento básico do site. Não podem ser desabilitados.',
      examples: ['Sessão do usuário', 'Preferências de idioma', 'Carrinho de compras', 'Autenticação'],
      required: true,
      color: 'green'
    },
    {
      id: 'analiticos',
      title: 'Cookies Analíticos',
      icon: FiBarChart,
      description: 'Coletam informações sobre como você usa nosso site para melhorar a experiência.',
      examples: ['Google Analytics', 'Hotjar', 'Métricas de performance', 'Análise de comportamento'],
      required: false,
      color: 'blue'
    },
    {
      id: 'funcionais',
      title: 'Cookies Funcionais',
      icon: FiSettings,
      description: 'Permitem funcionalidades avançadas e personalização da sua experiência.',
      examples: ['Preferências de tema', 'Configurações salvas', 'Chat online', 'Widgets personalizados'],
      required: false,
      color: 'purple'
    },
    {
      id: 'marketing',
      title: 'Cookies de Marketing',
      icon: FiTarget,
      description: 'Usados para exibir anúncios relevantes e medir a eficácia das campanhas.',
      examples: ['Google Ads', 'Facebook Pixel', 'Remarketing', 'Publicidade direcionada'],
      required: false,
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-600',
      blue: resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      purple: resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      orange: resolvedTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Política de Cookies | FinNEXTHO - Gerenciar Preferências</title>
        <meta name="description" content="Política de cookies da FinNEXTHO. Gerencie suas preferências e saiba como utilizamos cookies para melhorar sua experiência." />
      </Head>
      <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Cookie Banner */}
        {showBanner && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`fixed bottom-0 left-0 right-0 z-50 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-t shadow-lg p-6`}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FiDatabase className={`w-5 h-5 mr-2 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className="font-semibold">Utilizamos Cookies</h3>
                  </div>
                  <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Utilizamos cookies para melhorar sua experiência, analisar o uso do site e personalizar conteúdo. 
                    Você pode gerenciar suas preferências abaixo.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRejectOptional}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Apenas Essenciais
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Aceitar Todos
                  </button>
                  <button
                    onClick={() => setShowBanner(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Personalizar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <header className={`py-6 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="max-w-7xl mx-auto px-6">
            <Link href="/" className={`inline-flex items-center text-sm font-medium ${resolvedTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <FiDatabase className={`w-12 h-12 mr-4 ${resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
              <h1 className="text-4xl md:text-5xl font-bold">
                Política de <span className={resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Cookies</span>
              </h1>
            </div>
            <p className={`text-xl max-w-3xl mx-auto ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Transparência total sobre como utilizamos cookies para melhorar sua experiência na FinNEXTHO.
            </p>
          </motion.div>

          {/* O que são Cookies */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
              <div className="flex items-center mb-6">
                <FiInfo className={`w-8 h-8 mr-3 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className="text-3xl font-bold">O que são Cookies?</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className={`mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. 
                    Eles nos ajudam a lembrar suas preferências, melhorar a funcionalidade do site e fornecer 
                    uma experiência personalizada.
                  </p>
                  <p className={`mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Na FinNEXTHO, utilizamos cookies de forma responsável e transparente, sempre respeitando 
                    sua privacidade e dando a você controle total sobre suas preferências.
                  </p>
                </div>
                <div className={`${resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
                  <h3 className="font-semibold mb-4">Benefícios dos Cookies:</h3>
                  <ul className="space-y-2">
                    <li className={`flex items-center ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <FiCheckCircle className={`w-4 h-4 mr-2 ${resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                      Lembrar suas preferências
                    </li>
                    <li className={`flex items-center ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <FiCheckCircle className={`w-4 h-4 mr-2 ${resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                      Melhorar a performance do site
                    </li>
                    <li className={`flex items-center ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <FiCheckCircle className={`w-4 h-4 mr-2 ${resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                      Personalizar conteúdo
                    </li>
                    <li className={`flex items-center ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      <FiCheckCircle className={`w-4 h-4 mr-2 ${resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                      Analisar uso do site
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tipos de Cookies */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Tipos de Cookies que Utilizamos</h2>
              <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Gerencie suas preferências para cada tipo de cookie
              </p>
            </div>
            <div className="grid gap-6">
              {cookieTypes.map((cookie, index) => (
                <motion.div
                  key={cookie.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <cookie.icon className={`w-8 h-8 mr-4 ${getColorClasses(cookie.color)}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{cookie.title}</h3>
                          {cookie.required && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              resolvedTheme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                            }`}>
                              Obrigatório
                            </span>
                          )}
                        </div>
                        <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                          {cookie.description}
                        </p>
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Exemplos:</h4>
                          <div className="flex flex-wrap gap-2">
                            {cookie.examples.map((example, idx) => (
                              <span 
                                key={idx}
                                className={`px-3 py-1 rounded-full text-sm ${
                                  resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handlePreferenceChange(cookie.id)}
                        disabled={cookie.required}
                        className={`flex items-center p-2 rounded-lg transition-colors ${
                          cookie.required
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {cookiePreferences[cookie.id as keyof typeof cookiePreferences] ? (
                          <FiToggleRight className={`w-8 h-8 ${getColorClasses(cookie.color)}`} />
                        ) : (
                          <FiToggleLeft className={`w-8 h-8 ${resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Gerenciar Preferências */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg text-center`}>
              <FiSettings className={`w-12 h-12 mx-auto mb-4 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-2xl font-bold mb-4">Gerenciar Preferências</h2>
              <p className={`mb-6 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Suas preferências atuais de cookies. Você pode alterá-las a qualquer momento.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <button
                  onClick={handleSavePreferences}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FiSave className="w-5 h-5 mr-2" />
                  Salvar Preferências
                </button>
                <button
                  onClick={() => setCookiePreferences({ essenciais: true, analiticos: true, funcionais: true, marketing: true })}
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    resolvedTheme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <FiCheckCircle className="w-5 h-5 mr-2" />
                  Aceitar Todos
                </button>
                <button
                  onClick={() => setCookiePreferences({ essenciais: true, analiticos: false, funcionais: false, marketing: false })}
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    resolvedTheme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  <FiX className="w-5 h-5 mr-2" />
                  Apenas Essenciais
                </button>
              </div>
            </div>
          </motion.section>

          {/* Informações Adicionais */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className={`${resolvedTheme === 'dark' ? 'bg-gradient-to-r from-purple-900 to-blue-900' : 'bg-gradient-to-r from-purple-600 to-blue-600'} rounded-lg p-8 text-white`}
          >
            <div className="text-center mb-8">
              <FiEye className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Controle Total da Sua Privacidade</h2>
              <p className="text-lg opacity-90 mb-6">
                Você tem controle total sobre seus dados e pode alterar suas preferências a qualquer momento.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <FiRefreshCw className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Altere Quando Quiser</h3>
                <p className="text-sm opacity-80">Suas preferências podem ser modificadas a qualquer momento</p>
              </div>
              <div>
                <FiShield className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Dados Seguros</h3>
                <p className="text-sm opacity-80">Todos os dados são protegidos e criptografados</p>
              </div>
              <div>
                <FiCheckCircle className="w-8 h-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">LGPD Compliant</h3>
                <p className="text-sm opacity-80">Totalmente conforme a legislação brasileira</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link 
                href="/privacidade"
                className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                Leia nossa Política de Privacidade
                <FiArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </Link>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}