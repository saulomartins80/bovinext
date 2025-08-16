import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiMic, 
  FiDownload, 
  FiCalendar, 
  FiUser, 
  FiMail,
  FiPhone,
  FiFileText,
  FiImage,
  FiVideo,
  FiExternalLink,
  FiTrendingUp,
  FiUsers,
  FiGlobe
} from 'react-icons/fi';
import { useState } from 'react';

export default function Imprensa() {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('releases');

  const pressReleases = [
    {
      title: 'Finnextho Anuncia Expansão para Novos Mercados',
      date: '15 Jan 2025',
      summary: 'Plataforma de gestão financeira com IA expande operações para atender pequenas e médias empresas.',
      category: 'Expansão'
    },
    {
      title: 'Nova Funcionalidade de IA Preditiva Revoluciona Investimentos',
      date: '03 Jan 2025',
      summary: 'Algoritmos avançados agora oferecem previsões precisas para otimizar carteiras de investimento.',
      category: 'Produto'
    },
    {
      title: 'Finnextho Alcança Marco de 10.000 Usuários Ativos',
      date: '20 Dez 2024',
      summary: 'Crescimento de 300% em 2024 consolida posição no mercado de fintechs brasileiras.',
      category: 'Milestone'
    }
  ];

  const mediaKit = [
    {
      type: 'Logo',
      icon: FiImage,
      items: ['Logo PNG (Alta Resolução)', 'Logo SVG (Vetorial)', 'Logo Monocromático']
    },
    {
      type: 'Fotos',
      icon: FiImage,
      items: ['Fotos da Equipe', 'Escritório', 'Eventos']
    },
    {
      type: 'Documentos',
      icon: FiFileText,
      items: ['Fact Sheet', 'Biografia do CEO', 'Apresentação Institucional']
    },
    {
      type: 'Vídeos',
      icon: FiVideo,
      items: ['Vídeo Institucional', 'Depoimentos', 'Demo da Plataforma']
    }
  ];

  const pressContacts = [
    {
      name: 'Maria Silva',
      role: 'Assessora de Imprensa',
      email: 'maria.silva@finnextho.com',
      phone: '(11) 9999-8888',
      specialty: 'Tecnologia e Inovação'
    },
    {
      name: 'João Santos',
      role: 'Gerente de Comunicação',
      email: 'joao.santos@finnextho.com',
      phone: '(11) 9999-7777',
      specialty: 'Mercado Financeiro'
    }
  ];

  const companyFacts = [
    { label: 'Fundação', value: '2023' },
    { label: 'Sede', value: 'São Paulo, SP' },
    { label: 'Funcionários', value: '50+' },
    { label: 'Usuários Ativos', value: '10.000+' },
    { label: 'Volume Processado', value: 'R$ 100M+' },
    { label: 'Investimento Captado', value: 'R$ 5M' }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Imprensa | Finnextho - Kit de Imprensa e Releases</title>
        <meta name="description" content="Kit de imprensa, releases, materiais para jornalistas e contatos da Finnextho. Informações oficiais para mídia." />
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
              <FiMic className={`w-12 h-12 mr-4 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className="text-4xl md:text-5xl font-bold">
                Sala de <span className={resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Imprensa</span>
              </h1>
            </div>
            <p className={`text-xl max-w-3xl mx-auto ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Recursos, materiais e informações oficiais da Finnextho para jornalistas e veículos de comunicação.
            </p>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center mb-12"
          >
            {[
              { id: 'releases', label: 'Press Releases', icon: FiFileText },
              { id: 'kit', label: 'Kit de Imprensa', icon: FiDownload },
              { id: 'fatos', label: 'Fatos & Números', icon: FiTrendingUp },
              { id: 'contatos', label: 'Contatos', icon: FiUsers }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 mx-2 mb-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? resolvedTheme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : resolvedTheme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Press Releases */}
            {activeTab === 'releases' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Press Releases</h2>
                  <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Últimas notícias e comunicados oficiais
                  </p>
                </div>
                <div className="grid gap-6">
                  {pressReleases.map((release, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}
                    >
                      <div className="flex flex-wrap items-start justify-between mb-4">
                        <div className="flex-1">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                            resolvedTheme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {release.category}
                          </span>
                          <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
                          <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                            {release.summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          <FiCalendar className="w-4 h-4 mr-2" />
                          {release.date}
                        </div>
                        <button className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                          resolvedTheme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}>
                          <FiExternalLink className="w-4 h-4 mr-2" />
                          Ler Completo
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Kit de Imprensa */}
            {activeTab === 'kit' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Kit de Imprensa</h2>
                  <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Materiais oficiais para download
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {mediaKit.map((kit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
                    >
                      <kit.icon className={`w-12 h-12 mx-auto mb-4 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      <h3 className="text-xl font-semibold mb-4">{kit.type}</h3>
                      <ul className="space-y-2 mb-6">
                        {kit.items.map((item, idx) => (
                          <li key={idx} className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <button className={`w-full inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                        resolvedTheme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}>
                        <FiDownload className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Fatos & Números */}
            {activeTab === 'fatos' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Fatos & Números</h2>
                  <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Dados oficiais da Finnextho
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companyFacts.map((fact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg text-center`}
                    >
                      <div className={`text-3xl font-bold mb-2 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        {fact.value}
                      </div>
                      <div className={`text-sm font-medium ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {fact.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* CEO Bio */}
                <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
                  <div className="flex items-center mb-6">
                    <FiUser className={`w-8 h-8 mr-3 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className="text-2xl font-bold">Sobre o CEO</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <h4 className="text-xl font-semibold mb-3">Saulo Chagas da Silva Martins</h4>
                      <p className={`mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        CEO e Fundador da Finnextho, Saulo é um empreendedor visionário com mais de 10 anos de experiência 
                        no mercado financeiro e tecnológico. Formado em Engenharia de Software, possui especialização em 
                        Inteligência Artificial e Finanças.
                      </p>
                      <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Antes de fundar a Finnextho, trabalhou em grandes instituições financeiras e startups de tecnologia, 
                        desenvolvendo soluções inovadoras para democratizar o acesso a serviços financeiros inteligentes.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className={`w-32 h-32 mx-auto rounded-full mb-4 flex items-center justify-center text-4xl ${
                        resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        👨‍💼
                      </div>
                      <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Foto oficial disponível no kit de imprensa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contatos */}
            {activeTab === 'contatos' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Contatos para Imprensa</h2>
                  <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Nossa equipe está sempre disponível para atender jornalistas
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {pressContacts.map((contact, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
                    >
                      <div className="text-center mb-6">
                        <div className={`w-20 h-20 mx-auto rounded-full mb-4 flex items-center justify-center text-2xl ${
                          resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          👩‍💼
                        </div>
                        <h3 className="text-xl font-semibold">{contact.name}</h3>
                        <p className={`${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
                          {contact.role}
                        </p>
                        <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Especialidade: {contact.specialty}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <a 
                          href={`mailto:${contact.email}`}
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            resolvedTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <FiMail className={`w-5 h-5 mr-3 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          {contact.email}
                        </a>
                        <a 
                          href={`tel:${contact.phone.replace(/\D/g, '')}`}
                          className={`flex items-center p-3 rounded-lg transition-colors ${
                            resolvedTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <FiPhone className={`w-5 h-5 mr-3 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          {contact.phone}
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Contato Geral */}
                <div className={`${resolvedTheme === 'dark' ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} rounded-lg p-8 text-white text-center`}>
                  <FiGlobe className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Contato Geral de Imprensa</h3>
                  <p className="text-lg mb-6 opacity-90">
                    Para solicitações gerais ou urgentes
                  </p>
                  <div className="flex flex-wrap justify-center gap-6">
                    <a 
                      href="mailto:imprensa@finnextho.com"
                      className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                    >
                      <FiMail className="w-5 h-5 mr-2" />
                      imprensa@finnextho.com
                    </a>
                    <a 
                      href="tel:+5511999999999"
                      className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                    >
                      <FiPhone className="w-5 h-5 mr-2" />
                      (11) 9999-9999
                    </a>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}