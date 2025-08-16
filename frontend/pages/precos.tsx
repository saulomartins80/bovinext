import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Footer } from '../components/layout/Footer';
import { ClientHeader } from '../components/layout/ClientHeader';
import { useTheme } from '../context/ThemeContext';
import { 
  FiCheck, FiX, FiStar, FiZap, FiArrowRight, FiTrendingUp
} from 'react-icons/fi';
import { FaRocket, FaCrown } from 'react-icons/fa';
import Link from 'next/link';

export default function Precos() {
  const { resolvedTheme } = useTheme();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  // const [_selectedPlan, _setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: <FiTrendingUp className="w-8 h-8" />,
      description: 'Perfeito para começar sua jornada financeira',
      monthlyPrice: 29,
      yearlyPrice: 290,
      savings: 'Economize 17%',
      popular: false,
      features: [
        'Dashboard básico',
        'Até 3 contas bancárias',
        'Relatórios mensais',
        'Suporte por email',
        'App mobile',
        'Backup automático',
        'Análise de gastos básica'
      ],
      limitations: [
        'Sem IA preditiva',
        'Sem automação avançada',
        'Sem suporte prioritário'
      ],
      cta: 'Começar Grátis',
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: <FaRocket className="w-8 h-8" />,
      description: 'Para profissionais que querem mais controle',
      monthlyPrice: 79,
      yearlyPrice: 790,
      savings: 'Economize 17%',
      popular: true,
      features: [
        'Dashboard avançado',
        'Contas bancárias ilimitadas',
        'IA preditiva básica',
        'Relatórios personalizados',
        'Automação de investimentos',
        'Suporte prioritário',
        'API de integração',
        'Análise de riscos',
        'Metas financeiras',
        'Alertas inteligentes'
      ],
      limitations: [
        'Sem consultoria personalizada',
        'Sem white-label'
      ],
      cta: 'Teste 14 Dias Grátis',
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: <FaCrown className="w-8 h-8" />,
      description: 'Solução completa para empresas',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      savings: 'Economize 17%',
      popular: false,
      features: [
        'Tudo do Professional',
        'IA preditiva avançada',
        'Consultoria personalizada',
        'Suporte 24/7',
        'White-label disponível',
        'Integração ERP/CRM',
        'Relatórios executivos',
        'Multi-usuários',
        'Compliance automático',
        'Backup em tempo real',
        'SLA garantido',
        'Treinamento da equipe'
      ],
      limitations: [],
      cta: 'Falar com Vendas',
      color: 'gold'
    }
  ];

  const features = [
    {
      category: 'Recursos Básicos',
      items: [
        { name: 'Dashboard Personalizado', starter: true, professional: true, enterprise: true },
        { name: 'Conexão Bancária', starter: '3 contas', professional: 'Ilimitado', enterprise: 'Ilimitado' },
        { name: 'Relatórios', starter: 'Básicos', professional: 'Avançados', enterprise: 'Executivos' },
        { name: 'App Mobile', starter: true, professional: true, enterprise: true },
        { name: 'Backup Automático', starter: true, professional: true, enterprise: true }
      ]
    },
    {
      category: 'Inteligência Artificial',
      items: [
        { name: 'IA Preditiva', starter: false, professional: 'Básica', enterprise: 'Avançada' },
        { name: 'Análise de Padrões', starter: false, professional: true, enterprise: true },
        { name: 'Recomendações Personalizadas', starter: false, professional: true, enterprise: true },
        { name: 'Detecção de Anomalias', starter: false, professional: true, enterprise: true }
      ]
    },
    {
      category: 'Automação',
      items: [
        { name: 'Investimentos Automáticos', starter: false, professional: true, enterprise: true },
        { name: 'Alertas Inteligentes', starter: false, professional: true, enterprise: true },
        { name: 'Categorização Automática', starter: false, professional: true, enterprise: true },
        { name: 'Compliance Automático', starter: false, professional: false, enterprise: true }
      ]
    },
    {
      category: 'Suporte & Integração',
      items: [
        { name: 'Suporte', starter: 'Email', professional: 'Prioritário', enterprise: '24/7' },
        { name: 'API de Integração', starter: false, professional: true, enterprise: true },
        { name: 'Integração ERP/CRM', starter: false, professional: false, enterprise: true },
        { name: 'Consultoria Personalizada', starter: false, professional: false, enterprise: true }
      ]
    }
  ];

  const faqs = [
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento. Seus dados ficam disponíveis por 30 dias após o cancelamento.'
    },
    {
      question: 'Existe período de teste gratuito?',
      answer: 'Sim! Oferecemos 14 dias de teste gratuito para todos os planos, sem necessidade de cartão de crédito.'
    },
    {
      question: 'Como funciona a integração bancária?',
      answer: 'Utilizamos APIs seguras e certificadas pelos bancos. Seus dados são criptografados e nunca armazenamos senhas bancárias.'
    },
    {
      question: 'Posso mudar de plano depois?',
      answer: 'Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas no próximo ciclo de cobrança.'
    },
    {
      question: 'Há desconto para pagamento anual?',
      answer: 'Sim! Pagando anualmente você economiza 17% em todos os planos.'
    },
    {
      question: 'Os dados são seguros?',
      answer: 'Absolutamente! Utilizamos criptografia de nível bancário, certificações SOC 2 e ISO 27001. Seus dados nunca são compartilhados.'
    }
  ];

  const getPrice = (plan: { monthlyPrice: number; yearlyPrice: number }) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getPeriod = () => {
    return billingCycle === 'monthly' ? '/mês' : '/ano';
  };

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Planos e Preços | Finnextho</title>
        <meta name="description" content="Escolha o plano ideal para suas necessidades financeiras. Teste grátis por 14 dias, sem compromisso." />
        <meta property="og:title" content="Planos e Preços | Finnextho" />
        <meta property="og:description" content="Planos flexíveis para todas as necessidades financeiras" />
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
              Planos que <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Crescem</span> com Você
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Escolha o plano ideal para suas necessidades financeiras. Teste grátis por 14 dias.
            </p>

            {/* Billing Toggle */}
            <div className={`inline-flex items-center p-1 rounded-xl border ${
              resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : resolvedTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : resolvedTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Anual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-purple-500 shadow-2xl'
                    : resolvedTheme === 'dark' 
                      ? 'border-gray-700 hover:border-gray-600' 
                      : 'border-gray-200 hover:border-gray-300'
                } ${
                  resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center">
                      <FiStar className="w-4 h-4 mr-2" />
                      Mais Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${
                    plan.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    plan.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    'from-yellow-500 to-yellow-600'
                  } flex items-center justify-center text-white mx-auto mb-4`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-2 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </h3>
                  
                  <p className={`text-sm mb-6 ${
                    resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className={`text-5xl font-bold ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      R${getPrice(plan)}
                    </span>
                    <span className={`text-lg ${
                      resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {getPeriod()}
                    </span>
                  </div>
                  
                  {billingCycle === 'yearly' && (
                    <p className="text-green-600 text-sm font-semibold mb-6">
                      {plan.savings}
                    </p>
                  )}
                </div>

                <div className="mb-8">
                  <h4 className={`font-semibold mb-4 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Recursos inclusos:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-center text-sm ${
                        resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <FiCheck className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="mt-6">
                      <h5 className={`font-semibold mb-3 text-sm ${
                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Não inclui:
                      </h5>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className={`flex items-center text-sm ${
                            resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            <FiX className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105'
                      : plan.color === 'gold'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:shadow-lg transform hover:scale-105'
                      : resolvedTheme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta} <FiArrowRight className="inline ml-2" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
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
              Compare os <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recursos</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Veja em detalhes o que cada plano oferece
            </p>
          </motion.div>

          <div className={`overflow-x-auto rounded-2xl border ${
            resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <table className={`w-full ${
              resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <thead>
                <tr className={resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                  <th className={`text-left p-6 font-semibold ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Recursos
                  </th>
                  <th className={`text-center p-6 font-semibold ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Starter
                  </th>
                  <th className={`text-center p-6 font-semibold ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Professional
                  </th>
                  <th className={`text-center p-6 font-semibold ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr className={resolvedTheme === 'dark' ? 'bg-gray-750' : 'bg-gray-25'}>
                      <td colSpan={4} className={`p-4 font-semibold text-sm uppercase tracking-wide ${
                        resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className={`border-t ${
                        resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <td className={`p-4 ${
                          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {item.name}
                        </td>
                        <td className="p-4 text-center">
                          {typeof item.starter === 'boolean' ? (
                            item.starter ? (
                              <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className={`text-sm ${
                              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {item.starter}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof item.professional === 'boolean' ? (
                            item.professional ? (
                              <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className={`text-sm ${
                              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {item.professional}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {typeof item.enterprise === 'boolean' ? (
                            item.enterprise ? (
                              <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <FiX className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className={`text-sm ${
                              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {item.enterprise}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-6">
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
              Perguntas <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Frequentes</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl border ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900 border-gray-700' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-3 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {faq.question}
                </h3>
                <p className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {faq.answer}
                </p>
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
              Pronto para Transformar suas Finanças?
            </h2>
            <p className={`text-xl mb-8 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Comece seu teste gratuito hoje mesmo. Sem compromisso, sem cartão de crédito.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Começar Teste Gratuito <FiZap className="inline ml-2" />
              </Link>
              <Link href="/contato" className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 ${
                resolvedTheme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
              }`}>
                Falar com Especialista
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
