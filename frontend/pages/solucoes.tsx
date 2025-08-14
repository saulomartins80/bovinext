import React, { useEffect } from 'react';
import Head from 'next/head';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Footer } from '../components/layout/Footer';
import { ClientHeader } from '../components/layout/ClientHeader';
import { useTheme } from '../context/ThemeContext';
import { 
  FiShield, FiUsers, FiBarChart, FiCreditCard,
  FiSmartphone, FiArrowRight, FiCheck, FiStar, FiZap
} from 'react-icons/fi';
import { FaBitcoin, FaRobot, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';

export default function Solucoes() {
  const { resolvedTheme } = useTheme();
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const solutions = [
    {
      id: 'pessoal',
      title: 'Finanças Pessoais',
      subtitle: 'Para indivíduos que querem controlar melhor suas finanças',
      icon: <FiUsers className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Controle de gastos inteligente',
        'Planejamento de orçamento automático',
        'Análise de padrões de consumo',
        'Alertas personalizados',
        'Metas financeiras gamificadas'
      ],
      benefits: [
        'Economize até 30% dos seus gastos mensais',
        'Alcance suas metas 3x mais rápido',
        'Tenha visibilidade total das suas finanças'
      ]
    },
    {
      id: 'investimentos',
      title: 'Gestão de Investimentos',
      subtitle: 'Para investidores que buscam maximizar retornos',
      icon: <FaChartLine className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Portfolio diversificado automaticamente',
        'Análise de risco em tempo real',
        'Rebalanceamento inteligente',
        'Insights de mercado com IA',
        'Comparação de performance'
      ],
      benefits: [
        'Retornos 25% superiores à média do mercado',
        'Redução de risco através de diversificação',
        'Decisões baseadas em dados e IA'
      ]
    },
    {
      id: 'empresarial',
      title: 'Soluções Empresariais',
      subtitle: 'Para empresas que precisam de gestão financeira robusta',
      icon: <FiBarChart className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Dashboard executivo em tempo real',
        'Fluxo de caixa preditivo',
        'Gestão de múltiplas contas',
        'Relatórios personalizados',
        'Integração com ERPs'
      ],
      benefits: [
        'Melhore o fluxo de caixa em 40%',
        'Reduza tempo de análise em 80%',
        'Tome decisões mais assertivas'
      ]
    },
    {
      id: 'cripto',
      title: 'Criptomoedas',
      subtitle: 'Para quem quer diversificar em ativos digitais',
      icon: <FaBitcoin className="w-8 h-8" />,
      color: 'from-orange-500 to-yellow-500',
      features: [
        'Carteira multi-moedas segura',
        'Trading automatizado',
        'Análise técnica avançada',
        'Staking e DeFi integrados',
        'Alertas de mercado'
      ],
      benefits: [
        'Diversificação em mais de 100 criptomoedas',
        'Segurança militar para seus ativos',
        'Oportunidades de renda passiva'
      ]
    }
  ];

  const technologies = [
    {
      name: 'Inteligência Artificial',
      description: 'Machine Learning para análises preditivas e recomendações personalizadas',
      icon: <FaRobot className="w-6 h-6" />
    },
    {
      name: 'Blockchain',
      description: 'Segurança e transparência em todas as transações',
      icon: <FiShield className="w-6 h-6" />
    },
    {
      name: 'API Banking',
      description: 'Integração direta com mais de 200 instituições financeiras',
      icon: <FiCreditCard className="w-6 h-6" />
    },
    {
      name: 'Mobile First',
      description: 'Experiência otimizada para dispositivos móveis',
      icon: <FiSmartphone className="w-6 h-6" />
    }
  ];

  const stats = [
    { value: '50K+', label: 'Usuários Ativos' },
    { value: '98%', label: 'Satisfação' },
    { value: 'R$ 2B+', label: 'Patrimônio Gerenciado' },
    { value: '24/7', label: 'Suporte' }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Soluções Financeiras Inteligentes | FinNEXTHO</title>
        <meta name="description" content="Descubra nossas soluções financeiras personalizadas com IA integrada para pessoas físicas e empresas" />
        <meta property="og:title" content="Soluções Financeiras Inteligentes | FinNEXTHO" />
        <meta property="og:description" content="Transforme sua vida financeira com nossas soluções inteligentes" />
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
              Soluções que <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transformam</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Tecnologia de ponta para revolucionar sua gestão financeira, seja você pessoa física ou empresa
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Começar Agora
              </Link>
              <button className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 ${
                resolvedTheme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
              }`}>
                Ver Demonstração
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={controls}
            variants={{
              visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
            }}
            className="text-center mb-16"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Nossas Soluções
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Escolha a solução perfeita para suas necessidades financeiras
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 30 }}
                animate={controls}
                variants={{
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { duration: 0.8, delay: index * 0.1 } 
                  }
                }}
                className={`p-8 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${solution.color} flex items-center justify-center text-white mb-6`}>
                  {solution.icon}
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {solution.title}
                </h3>
                
                <p className={`mb-6 ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {solution.subtitle}
                </p>

                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Recursos Principais:
                  </h4>
                  <ul className="space-y-2">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-center ${
                        resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Benefícios:
                  </h4>
                  <ul className="space-y-2">
                    {solution.benefits.map((benefit, idx) => (
                      <li key={idx} className={`flex items-center ${
                        resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <FiStar className="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r ${solution.color} text-white hover:shadow-lg hover:scale-105`}>
                  Saiba Mais <FiArrowRight className="inline ml-2" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
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
              Tecnologia de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Ponta</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Utilizamos as mais avançadas tecnologias para garantir segurança, performance e inovação
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technologies.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mx-auto mb-4`}>
                  {tech.icon}
                </div>
                <h3 className={`font-bold mb-2 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {tech.name}
                </h3>
                <p className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {tech.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
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
              Pronto para Transformar suas Finanças?
            </h2>
            <p className={`text-xl mb-8 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Junte-se a milhares de usuários que já revolucionaram sua gestão financeira
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Começar Agora <FiZap className="inline ml-2" />
              </Link>
              <Link href="/contato" className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 ${
                resolvedTheme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
              }`}>
                Experimentar Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}