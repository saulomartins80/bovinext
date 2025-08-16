import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Footer } from '../components/layout/Footer';
import { ClientHeader } from '../components/layout/ClientHeader';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  FiUsers, FiMessageCircle, FiCalendar, FiSearch,
  FiFilter, FiPlus, FiEye, FiShare2
} from 'react-icons/fi';
import { FaDiscord, FaTelegram, FaWhatsapp, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

export default function Comunidade() {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('forum');
  const [searchTerm, setSearchTerm] = useState('');
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const forumTopics = [
    {
      id: 1,
      title: 'Estratégias de Investimento para 2024',
      author: 'Carlos Silva',
      avatar: '/avatars/carlos.jpg',
      category: 'Investimentos',
      replies: 45,
      views: 1200,
      lastActivity: '2 horas atrás',
      isPinned: true,
      tags: ['investimentos', 'estratégia', '2024']
    },
    {
      id: 2,
      title: 'Como economizar 30% do salário sem sacrificar qualidade de vida',
      author: 'Ana Beatriz',
      avatar: '/avatars/ana.jpg',
      category: 'Economia',
      replies: 32,
      views: 890,
      lastActivity: '4 horas atrás',
      isPinned: false,
      tags: ['economia', 'orçamento', 'dicas']
    },
    {
      id: 3,
      title: 'Análise: Fundos Imobiliários vs Ações',
      author: 'Roberto Costa',
      avatar: '/avatars/roberto.jpg',
      category: 'Análises',
      replies: 28,
      views: 650,
      lastActivity: '1 dia atrás',
      isPinned: false,
      tags: ['fiis', 'ações', 'comparação']
    }
  ];

  const groups = [
    {
      id: 1,
      name: 'Investidores Iniciantes',
      description: 'Grupo para quem está começando no mundo dos investimentos',
      members: 2847,
      category: 'Investimentos',
      isPrivate: false,
      image: '/groups/iniciantes.jpg'
    },
    {
      id: 2,
      name: 'Cripto Traders BR',
      description: 'Discussões sobre criptomoedas e trading',
      members: 1523,
      category: 'Criptomoedas',
      isPrivate: false,
      image: '/groups/cripto.jpg'
    },
    {
      id: 3,
      name: 'Empreendedores Financeiros',
      description: 'Networking para empreendedores do setor financeiro',
      members: 892,
      category: 'Empreendedorismo',
      isPrivate: true,
      image: '/groups/empreendedores.jpg'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'Webinar: Tendências do Mercado Financeiro 2024',
      date: '2024-02-15',
      time: '19:00',
      type: 'online',
      attendees: 234,
      maxAttendees: 500,
      speaker: 'Dr. Fernando Oliveira',
      image: '/events/webinar1.jpg'
    },
    {
      id: 2,
      title: 'Meetup: Networking de Investidores - São Paulo',
      date: '2024-02-20',
      time: '18:30',
      type: 'presencial',
      attendees: 45,
      maxAttendees: 80,
      speaker: 'Comunidade Finnextho',
      image: '/events/meetup1.jpg'
    }
  ];

  const stats = [
    { value: '15K+', label: 'Membros Ativos' },
    { value: '2.3K', label: 'Discussões' },
    { value: '45', label: 'Grupos' },
    { value: '120+', label: 'Eventos Realizados' }
  ];

  const socialChannels = [
    { name: 'Discord', icon: <FaDiscord />, members: '8.5K', link: '#' },
    { name: 'Telegram', icon: <FaTelegram />, members: '12K', link: '#' },
    { name: 'WhatsApp', icon: <FaWhatsapp />, members: '5.2K', link: '#' },
    { name: 'LinkedIn', icon: <FaLinkedin />, members: '15K', link: '#' }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Comunidade Finnextho | Conecte-se com Investidores</title>
        <meta name="description" content="Faça parte da maior comunidade de investidores e entusiastas financeiros do Brasil" />
      </Head>

      <ClientHeader />
      
      {/* Hero Section */}
      <section className={`pt-32 pb-20 ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-100'}`}>
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
              Comunidade <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Finnextho</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Conecte-se com milhares de investidores, compartilhe conhecimento e cresça junto com a comunidade
            </p>
            
            {user ? (
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  <FiPlus className="inline mr-2" /> Criar Tópico
                </button>
                <button className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 ${
                  resolvedTheme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
                }`}>
                  Explorar Grupos
                </button>
              </div>
            ) : (
              <Link href="/auth/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-block">
                Junte-se à Comunidade
              </Link>
            )}
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

      {/* Navigation Tabs */}
      <section className={`py-8 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-b ${resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { id: 'forum', label: 'Fórum', icon: <FiMessageCircle /> },
              { id: 'grupos', label: 'Grupos', icon: <FiUsers /> },
              { id: 'eventos', label: 'Eventos', icon: <FiCalendar /> },
              { id: 'social', label: 'Redes Sociais', icon: <FiShare2 /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : resolvedTheme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Forum Tab */}
          {activeTab === 'forum' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar discussões..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          resolvedTheme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                  <button className={`px-6 py-3 rounded-lg border transition-all duration-300 ${
                    resolvedTheme === 'dark'
                      ? 'border-gray-700 text-gray-300 hover:border-gray-600'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}>
                    <FiFilter className="inline mr-2" /> Filtros
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {forumTopics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {topic.isPinned && (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded mr-2">
                              Fixado
                            </span>
                          )}
                          <span className={`text-sm px-2 py-1 rounded ${
                            resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {topic.category}
                          </span>
                        </div>
                        
                        <h3 className={`text-xl font-semibold mb-2 ${
                          resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {topic.title}
                        </h3>
                        
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                            {topic.author.charAt(0)}
                          </div>
                          <span className={`text-sm ${
                            resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            por {topic.author} • {topic.lastActivity}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {topic.tags.map((tag, idx) => (
                            <span key={idx} className={`text-xs px-2 py-1 rounded ${
                              resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className="flex items-center mb-1">
                            <FiMessageCircle className="w-4 h-4 mr-1" />
                            {topic.replies}
                          </div>
                          <div className="flex items-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            {topic.views}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Groups Tab */}
          {activeTab === 'grupos' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <motion.div
                    key={group.id}
                    whileHover={{ scale: 1.05 }}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mb-4"></div>
                    
                    <h3 className={`text-xl font-semibold mb-2 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {group.name}
                      {group.isPrivate && (
                        <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                          Privado
                        </span>
                      )}
                    </h3>
                    
                    <p className={`mb-4 ${
                      resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {group.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <FiUsers className="inline mr-1" />
                        {group.members.toLocaleString()} membros
                      </span>
                      
                      <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300">
                        Participar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === 'eventos' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-xl border transition-all duration-300 ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-full h-40 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mb-4"></div>
                    
                    <h3 className={`text-xl font-semibold mb-2 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {event.title}
                    </h3>
                    
                    <div className={`mb-4 space-y-2 ${
                      resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center">
                        <FiCalendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="w-4 h-4 mr-2" />
                        {event.attendees}/{event.maxAttendees} participantes
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.type === 'online' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.type === 'online' ? 'Online' : 'Presencial'}
                        </span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                      Participar do Evento
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {socialChannels.map((channel, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className={`p-6 rounded-xl border text-center transition-all duration-300 ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-4 text-purple-600">
                      {channel.icon}
                    </div>
                    
                    <h3 className={`text-xl font-semibold mb-2 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {channel.name}
                    </h3>
                    
                    <p className={`mb-4 ${
                      resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {channel.members} membros
                    </p>
                    
                    <Link href={channel.link} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 inline-block">
                      Participar
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
