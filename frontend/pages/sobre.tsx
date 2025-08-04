import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiUsers, 
  FiTarget, 
  FiHeart, 
  FiTrendingUp, 
  FiShield, 
  FiGlobe,
  FiAward,
  FiCalendar,
  FiLinkedin,
  FiTwitter
} from 'react-icons/fi';
import { useState } from 'react';

export default function Sobre() {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('historia');

  const stats = [
    { label: 'Usuários Ativos', value: '15.000+', icon: FiUsers },
    { label: 'Transações Processadas', value: 'R$ 2.5B+', icon: FiTrendingUp },
    { label: 'Uptime', value: '99.9%', icon: FiShield },
    { label: 'Países Atendidos', value: '12+', icon: FiGlobe }
  ];

  const timeline = [
    {
      year: '2023',
      title: 'Fundação',
      description: 'FinNEXTHO é fundada com a missão de democratizar o acesso a ferramentas financeiras inteligentes.'
    },
    {
      year: '2023',
      title: 'Primeiro Produto',
      description: 'Lançamento da plataforma de gestão financeira pessoal com IA integrada.'
    },
    {
      year: '2024',
      title: 'Expansão',
      description: 'Alcançamos 10.000 usuários e expandimos para mercados internacionais.'
    },
    {
      year: '2024',
      title: 'Inovação',
      description: 'Introdução de recursos avançados de IA preditiva e automação financeira.'
    }
  ];

  const team = [
    {
      name: 'Saulo  Martins',
      role: 'CEO & Fundador',
      bio: 'Visionário e empreendedor, fundador da FinNEXTHO com expertise em tecnologia financeira e inovação',
      image: '/api/placeholder/150/150',
      linkedin: '#'
    },
    {
      name: 'Sirley Celestino ',
      role: 'CTO & Co-fundadora',
      bio: 'Ex-engenheira sênior do IFPAX, especialista em IA',
      image: '/api/placeholder/150/150',
      linkedin: '#'
    },
    {
      name: 'David mota',
      role: 'Head of Product',
      bio: 'Ex-product manager do iFood, focada em UX',
      image: '/api/placeholder/150/150',
      linkedin: '#'
    },
    {
      name: 'Cleber portolino ',
      role: 'Head of Engineering',
      bio: 'Ex-tech lead da Stone, especialista em Web designer',
      image: '/api/placeholder/150/150',
      linkedin: '#'
    }
  ];

  const values = [
    {
      icon: FiTarget,
      title: 'Transparência',
      description: 'Acreditamos em total transparência em todas as nossas operações e comunicações.'
    },
    {
      icon: FiHeart,
      title: 'Empatia',
      description: 'Colocamos nossos usuários no centro de tudo que fazemos, entendendo suas necessidades.'
    },
    {
      icon: FiShield,
      title: 'Segurança',
      description: 'Protegemos os dados e recursos financeiros dos nossos usuários com máxima segurança.'
    },
    {
      icon: FiTrendingUp,
      title: 'Inovação',
      description: 'Buscamos constantemente novas tecnologias para melhorar a experiência financeira.'
    }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Sobre Nós | FinNEXTHO</title>
        <meta name="description" content="Conheça a história, missão e equipe da FinNEXTHO. Transformando a relação das pessoas com o dinheiro através da tecnologia." />
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

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold mb-6">
                Sobre a <span className="text-blue-600">FinNEXTHO</span>
              </h1>
              <p className={`text-xl max-w-3xl mx-auto mb-12 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Transformamos a relação das pessoas com o dinheiro através da tecnologia, 
                oferecendo soluções financeiras inteligentes e acessíveis para todos.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[
                { id: 'historia', label: 'Nossa História' },
                { id: 'missao', label: 'Missão & Valores' },
                { id: 'equipe', label: 'Nossa Equipe' },
                { id: 'timeline', label: 'Timeline' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : resolvedTheme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {activeTab === 'historia' && (
                <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg`}>
                  <h2 className="text-3xl font-bold mb-6">Nossa História</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className={`text-lg mb-6 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        A FinNEXTHO nasceu da frustração de nossos fundadores com as ferramentas financeiras 
                        tradicionais. Em 2023, decidimos criar uma plataforma que combinasse inteligência 
                        artificial com design intuitivo para democratizar o acesso a gestão financeira profissional.
                      </p>
                      <p className={`text-lg mb-6 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Começamos como uma startup pequena com uma grande visão: tornar a gestão financeira 
                        acessível, inteligente e eficaz para todos, independentemente do conhecimento financeiro.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <FiAward className="w-6 h-6 text-blue-600 mb-2" />
                        <h3 className="font-semibold mb-2">Reconhecimento</h3>
                        <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Eleita &ldquo;Melhor Fintech Emergente&rdquo; pelo TechCrunch 2024
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
                        <FiTrendingUp className="w-6 h-6 text-green-600 mb-2" />
                        <h3 className="font-semibold mb-2">Crescimento</h3>
                        <p className={`text-sm mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          Crescimento de 300% em usuários ativos nos últimos 12 meses
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'missao' && (
                <div className="space-y-8">
                  <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg`}>
                    <h2 className="text-3xl font-bold mb-6">Nossa Missão</h2>
                    <p className={`text-xl mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Democratizar o acesso a ferramentas financeiras inteligentes, capacitando pessoas 
                      e empresas a tomar decisões financeiras mais informadas e alcançar seus objetivos.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {values.map((value, index) => (
                      <motion.div
                        key={index}
                        className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <value.icon className="w-8 h-8 text-blue-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                        <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {value.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'equipe' && (
                <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg`}>
                  <h2 className="text-3xl font-bold mb-8 text-center">Nossa Equipe</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, index) => (
                      <motion.div
                        key={index}
                        className="text-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                        <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                        <p className={`text-sm mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {member.bio}
                        </p>
                        <div className="flex justify-center space-x-3">
                          <a href={member.linkedin} className="text-blue-600 hover:text-blue-700">
                            <FiLinkedin className="w-5 h-5" />
                          </a>
                          <a href="#" className="text-gray-600 hover:text-gray-700">
                            <FiTwitter className="w-5 h-5" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg`}>
                  <h2 className="text-3xl font-bold mb-8 text-center">Nossa Jornada</h2>
                  <div className="space-y-8">
                    {timeline.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start space-x-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <FiCalendar className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl font-bold text-blue-600 mr-4">{item.year}</span>
                            <h3 className="text-xl font-semibold">{item.title}</h3>
                          </div>
                          <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-12 shadow-lg`}
            >
              <h2 className="text-3xl font-bold mb-6">Junte-se à Nossa Missão</h2>
              <p className={`text-lg mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Faça parte da revolução financeira. Comece sua jornada com a FinNEXTHO hoje mesmo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/registro" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Começar Agora
                </Link>
                <Link href="/contato" className={`px-8 py-3 rounded-lg font-semibold border-2 transition-colors ${
                  resolvedTheme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Falar Conosco
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}