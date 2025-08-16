import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiUsers, 
  FiTrendingUp, 
  FiGlobe, 
  FiShield, 
  FiCode, 
  FiDollarSign,
  FiAward,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiArrowRight,
  FiTarget,
  FiHeart,
  FiZap
} from 'react-icons/fi';
import { useState } from 'react';

export default function Parceiros() {
  const { resolvedTheme } = useTheme();
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    tipoParcerias: '',
    mensagem: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria implementada a lógica de envio
    console.log('Dados do formulário:', formData);
    alert('Obrigado pelo interesse! Entraremos em contato em breve.');
  };

  const partnershipTypes = [
    {
      icon: FiCode,
      title: 'Integração Tecnológica',
      description: 'APIs, SDKs e soluções técnicas integradas',
      benefits: ['Acesso a APIs premium', 'Suporte técnico dedicado', 'Documentação completa']
    },
    {
      icon: FiDollarSign,
      title: 'Programa de Afiliados',
      description: 'Ganhe comissões indicando novos clientes',
      benefits: ['Comissões até 30%', 'Dashboard de acompanhamento', 'Materiais de marketing']
    },
    {
      icon: FiUsers,
      title: 'Parcerias Estratégicas',
      description: 'Colaborações de longo prazo e co-marketing',
      benefits: ['Eventos conjuntos', 'Conteúdo colaborativo', 'Cross-selling']
    },
    {
      icon: FiGlobe,
      title: 'Canais de Distribuição',
      description: 'Revenda e distribuição de soluções Finnextho',
      benefits: ['Margens atrativas', 'Treinamento completo', 'Suporte comercial']
    }
  ];

  const currentPartners = [
    { name: 'TechBank', logo: '', category: 'Instituição Financeira' },
    { name: 'InvestPro', logo: '', category: 'Corretora' },
    { name: 'DataFlow', logo: '', category: 'Tecnologia' },
    { name: 'SecureAPI', logo: '', category: 'Segurança' },
    { name: 'CloudTech', logo: '', category: 'Infraestrutura' },
    { name: 'AnalyticsPro', logo: '', category: 'Analytics' }
  ];

  const benefits = [
    {
      icon: FiTrendingUp,
      title: 'Crescimento Mútuo',
      description: 'Expandimos juntos no mercado financeiro'
    },
    {
      icon: FiShield,
      title: 'Confiabilidade',
      description: 'Parceiros verificados e certificados'
    },
    {
      icon: FiAward,
      title: 'Reconhecimento',
      description: 'Destaque como parceiro oficial Finnextho'
    },
    {
      icon: FiZap,
      title: 'Inovação',
      description: 'Acesso antecipado a novas funcionalidades'
    }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Parceiros | Finnextho - Parcerias Estratégicas</title>
        <meta name="description" content="Conheça nossos parceiros e oportunidades de colaboração. Programas de afiliados, integrações tecnológicas e parcerias estratégicas." />
      </Head>
      <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
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
              <FiUsers className={`w-12 h-12 mr-4 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className="text-4xl md:text-5xl font-bold">
                Parceiros <span className={resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Finnextho</span>
              </h1>
            </div>
            <p className={`text-xl max-w-3xl mx-auto ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Construindo o futuro das finanças através de parcerias estratégicas. 
              Junte-se ao nosso ecossistema de inovação e cresça conosco.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="text-center">
                <div className={`text-3xl font-bold ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>50+</div>
                <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Parceiros Ativos</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>R$ 10M+</div>
                <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Volume Processado</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>95%</div>
                <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Satisfação</div>
              </div>
            </div>
          </motion.div>

          {/* Tipos de Parcerias */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Tipos de Parcerias</h2>
              <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Encontre a modalidade de parceria ideal para seu negócio
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {partnershipTypes.map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}
                >
                  <type.icon className={`w-12 h-12 mb-4 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-xl font-semibold mb-3">{type.title}</h3>
                  <p className={`mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {type.description}
                  </p>
                  <ul className="space-y-2">
                    {type.benefits.map((benefit, idx) => (
                      <li key={idx} className={`flex items-center text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FiCheckCircle className={`w-4 h-4 mr-2 ${resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Parceiros Atuais */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Nossos Parceiros</h2>
              <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Empresas que confiam na Finnextho
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {currentPartners.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all hover:scale-105`}
                >
                  <div className="text-4xl mb-3">{partner.logo}</div>
                  <h3 className="font-semibold mb-1">{partner.name}</h3>
                  <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {partner.category}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Benefícios */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Por que ser Parceiro?</h2>
              <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Vantagens exclusivas para nossos parceiros
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="text-center"
                >
                  <benefit.icon className={`w-16 h-16 mx-auto mb-4 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Formulário de Contato */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-16"
          >
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
              <div className="text-center mb-8">
                <FiTarget className={`w-12 h-12 mx-auto mb-4 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className="text-3xl font-bold mb-4">Torne-se um Parceiro</h2>
                <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Preencha o formulário e nossa equipe entrará em contato
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${resolvedTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Empresa *
                    </label>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${resolvedTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${resolvedTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${resolvedTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Parceria *
                  </label>
                  <select
                    name="tipoParcerias"
                    value={formData.tipoParcerias}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${resolvedTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Selecione o tipo de parceria</option>
                    <option value="integracao">Integração Tecnológica</option>
                    <option value="afiliados">Programa de Afiliados</option>
                    <option value="estrategica">Parceria Estratégica</option>
                    <option value="distribuicao">Canal de Distribuição</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Mensagem
                  </label>
                  <textarea
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border ${resolvedTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Conte-nos mais sobre sua proposta de parceria..."
                  />
                </div>
                
                <div className="text-center">
                  <button
                    type="submit"
                    className={`inline-flex items-center px-8 py-4 rounded-lg font-semibold text-white transition-colors ${
                      resolvedTheme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FiMail className="w-5 h-5 mr-2" />
                    Enviar Proposta
                    <FiArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </form>
            </div>
          </motion.section>

          {/* Contato Direto */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className={`${resolvedTheme === 'dark' ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} rounded-lg p-8 text-white text-center`}
          >
            <FiHeart className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Prefere Falar Diretamente?</h2>
            <p className="text-lg mb-6 opacity-90">
              Nossa equipe de parcerias está sempre disponível para conversar
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="mailto:parcerias@Finnextho.com"
                className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <FiMail className="w-5 h-5 mr-2" />
                parcerias@Finnextho.com
              </a>
              <a 
                href="tel:+5511999999999"
                className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <FiPhone className="w-5 h-5 mr-2" />
                (11) 9999-9999
              </a>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
