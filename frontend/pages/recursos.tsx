import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Footer } from '../components/layout/Footer';
import { ClientHeader } from '../components/layout/ClientHeader';
import { useTheme } from '../context/ThemeContext';
import { 
  FiTrendingUp, FiPieChart, FiTarget, FiShield, FiUsers, FiBarChart2,
  FiZap, FiCloud, FiSmartphone, FiGlobe, FiDatabase, FiHeadphones, FiCheck, FiArrowRight
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import Link from 'next/link';

export default function Recursos() {
  const { resolvedTheme } = useTheme();

  const mainFeatures = [
    {
      title: 'IA Preditiva Avançada',
      description: 'Algoritmos de machine learning que analisam padrões e preveem tendências do mercado financeiro.',
      icon: <FaRobot className="w-8 h-8" />,
      color: 'purple',
      benefits: [
        'Previsões de mercado com 85% de precisão',
        'Análise de sentimento em tempo real',
        'Recomendações personalizadas',
        'Detecção automática de oportunidades'
      ]
    },
    {
      title: 'Dashboard Inteligente',
      description: 'Interface moderna e intuitiva que centraliza todas suas informações financeiras.',
      icon: <FiPieChart className="w-8 h-8" />,
      color: 'blue',
      benefits: [
        'Visualização em tempo real',
        'Gráficos interativos e personalizáveis',
        'Widgets configuráveis',
        'Modo escuro/claro'
      ]
    },
    {
      title: 'Automação Financeira',
      description: 'Automatize investimentos, transferências e pagamentos com regras inteligentes.',
      icon: <FiZap className="w-8 h-8" />,
      color: 'yellow',
      benefits: [
        'Investimentos automáticos',
        'Rebalanceamento de portfólio',
        'Pagamentos recorrentes',
        'Alertas personalizados'
      ]
    },
    {
      title: 'Segurança Bancária',
      description: 'Proteção de nível bancário com criptografia end-to-end e autenticação multifator.',
      icon: <FiShield className="w-8 h-8" />,
      color: 'green',
      benefits: [
        'Criptografia AES-256',
        'Autenticação biométrica',
        'Monitoramento 24/7',
        'Certificações SOC 2 e ISO 27001'
      ]
    }
  ];

  const additionalFeatures = [
    {
      title: 'Análise de Investimentos',
      description: 'Ferramentas avançadas para análise e acompanhamento de seus investimentos.',
      icon: <FiTrendingUp className="w-6 h-6" />,
    },
    {
      title: 'Metas Financeiras',
      description: 'Defina e acompanhe suas metas com planos personalizados.',
      icon: <FiTarget className="w-6 h-6" />,
    },
    {
      title: 'Comunidade Ativa',
      description: 'Conecte-se com outros investidores e compartilhe experiências.',
      icon: <FiUsers className="w-6 h-6" />,
    },
    {
      title: 'Relatórios Detalhados',
      description: 'Relatórios completos e insights sobre seus investimentos.',
      icon: <FiBarChart2 className="w-6 h-6" />,
    },
    {
      title: 'App Mobile',
      description: 'Acesse suas finanças em qualquer lugar com nosso app nativo.',
      icon: <FiSmartphone className="w-6 h-6" />,
    },
    {
      title: 'Suporte 24/7',
      description: 'Suporte técnico especializado disponível a qualquer momento.',
      icon: <FiHeadphones className="w-6 h-6" />,
    },
    {
      title: 'Integração Bancária',
      description: 'Conecte todas suas contas bancárias de forma segura.',
      icon: <FiGlobe className="w-6 h-6" />,
    },
    {
      title: 'Backup Automático',
      description: 'Seus dados sempre seguros com backup automático na nuvem.',
      icon: <FiCloud className="w-6 h-6" />,
    },
    {
      title: 'API Aberta',
      description: 'Integre com outras ferramentas através da nossa API REST.',
      icon: <FiDatabase className="w-6 h-6" />,
    }
  ];

  const integrations = [
    { name: 'Banco do Brasil', logo: '/integrations/bb.png' },
    { name: 'Itaú', logo: '/integrations/itau.png' },
    { name: 'Bradesco', logo: '/integrations/bradesco.png' },
    { name: 'Santander', logo: '/integrations/santander.png' },
    { name: 'Nubank', logo: '/integrations/nubank.png' },
    { name: 'Inter', logo: '/integrations/inter.png' },
    { name: 'XP Investimentos', logo: '/integrations/xp.png' },
    { name: 'Rico', logo: '/integrations/rico.png' }
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime Garantido' },
    { value: '< 100ms', label: 'Tempo de Resposta' },
    { value: '256-bit', label: 'Criptografia SSL' },
    { value: '24/7', label: 'Monitoramento' }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Recursos e Funcionalidades | Finnextho</title>
        <meta name="description" content="Descubra todos os recursos avançados da plataforma Finnextho. IA preditiva, automação financeira e muito mais." />
        <meta property="og:title" content="Recursos e Funcionalidades | Finnextho" />
        <meta property="og:description" content="Recursos avançados para transformar suas finanças" />
      </Head>

      <ClientHeader />
      
      {/* Hero Section */}
      <section className={`pt-32 pb-20 ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recursos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Avançados</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Descubra como nossa tecnologia de ponta pode transformar sua gestão financeira
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Principais Funcionalidades
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Tecnologia de ponta para uma experiência financeira única
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${
                    feature.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    feature.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    feature.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                    'from-green-500 to-green-600'
                  } flex items-center justify-center text-white mr-6 flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-3 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-lg mb-4 ${
                      resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className={`flex items-center ${
                      resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <FiCheck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Mais <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recursos</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Integrações Disponíveis
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Conecte-se com os principais bancos e corretoras do Brasil
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-4 rounded-xl border transition-all duration-300 hover:scale-110 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="font-semibold text-white text-xs text-center">
                    {integration.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Experimente Todos os Recursos
            </h2>
            <p className={`text-xl mb-8 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Teste grátis por 14 dias e descubra como podemos transformar suas finanças
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Começar Teste Gratuito <FiZap className="inline ml-2" />
              </Link>
              <Link href="/precos" className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 ${
                resolvedTheme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
              }`}>
                Ver Planos <FiArrowRight className="inline ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 
