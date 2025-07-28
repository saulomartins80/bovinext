import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiBookOpen, 
  FiSearch, 
  FiCalendar, 
  FiUser, 
  FiClock, 
  FiTag,
  FiTrendingUp,
  FiDollarSign,
  FiShield,
  FiSmartphone,
  FiBarChart,
  FiArrowRight
} from 'react-icons/fi';
import { useState } from 'react';

export default function Blog() {
  const { resolvedTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'todos', label: 'Todos os Posts', count: 12 },
    { id: 'investimentos', label: 'Investimentos', count: 4 },
    { id: 'educacao', label: 'Educação Financeira', count: 3 },
    { id: 'tecnologia', label: 'Tecnologia', count: 3 },
    { id: 'mercado', label: 'Mercado', count: 2 }
  ];

  const featuredPost = {
    id: 1,
    title: 'Como a IA está Revolucionando os Investimentos Pessoais',
    excerpt: 'Descubra como a inteligência artificial pode otimizar sua carteira de investimentos e maximizar seus retornos com análises preditivas avançadas.',
    author: 'Saulo Chagas da Silva Martins',
    date: '15 de Janeiro, 2024',
    readTime: '8 min',
    category: 'Investimentos',
    image: '/api/placeholder/800/400',
    featured: true
  };

  const blogPosts = [
    {
      id: 2,
      title: 'Guia Completo: Primeiros Passos para Investir',
      excerpt: 'Um guia prático para iniciantes que querem começar a investir com segurança e inteligência.',
      author: 'Maria Oliveira',
      date: '12 de Janeiro, 2024',
      readTime: '6 min',
      category: 'Educação Financeira',
      image: '/api/placeholder/400/250',
      icon: FiDollarSign
    },
    {
      id: 3,
      title: 'Tendências do Mercado Financeiro em 2024',
      excerpt: 'Análise das principais tendências que vão moldar o mercado financeiro neste ano.',
      author: 'Carlos Santos',
      date: '10 de Janeiro, 2024',
      readTime: '5 min',
      category: 'Mercado',
      image: '/api/placeholder/400/250',
      icon: FiTrendingUp
    },
    {
      id: 4,
      title: 'Segurança Digital: Protegendo suas Finanças Online',
      excerpt: 'Dicas essenciais para manter suas informações financeiras seguras no mundo digital.',
      author: 'João Costa',
      date: '8 de Janeiro, 2024',
      readTime: '7 min',
      category: 'Tecnologia',
      image: '/api/placeholder/400/250',
      icon: FiShield
    },
    {
      id: 5,
      title: 'Apps de Finanças: Como Escolher o Melhor para Você',
      excerpt: 'Comparativo dos melhores aplicativos de gestão financeira disponíveis no mercado.',
      author: 'Maria Oliveira',
      date: '5 de Janeiro, 2024',
      readTime: '4 min',
      category: 'Tecnologia',
      image: '/api/placeholder/400/250',
      icon: FiSmartphone
    },
    {
      id: 6,
      title: 'Análise de Dados: O Futuro da Gestão Financeira',
      excerpt: 'Como a análise de dados está transformando a forma como gerenciamos nossas finanças.',
      author: 'Carlos Santos',
      date: '3 de Janeiro, 2024',
      readTime: '6 min',
      category: 'Tecnologia',
      image: '/api/placeholder/400/250',
      icon: FiBarChart
    },
    {
      id: 7,
      title: '10 Dicas para Economizar Mais Todo Mês',
      excerpt: 'Estratégias práticas e eficazes para reduzir gastos e aumentar suas economias mensais.',
      author: 'Saulo Chagas da Silva Martins',
      date: '1 de Janeiro, 2024',
      readTime: '5 min',
      category: 'Educação Financeira',
      image: '/api/placeholder/400/250',
      icon: FiDollarSign
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'todos' || post.category.toLowerCase().includes(selectedCategory);
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Blog | FinNEXTHO - Educação Financeira e Tecnologia</title>
        <meta name="description" content="Artigos sobre educação financeira, investimentos, tecnologia e tendências do mercado. Conteúdo exclusivo da FinNEXTHO para sua evolução financeira." />
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
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center mb-6">
                <FiBookOpen className="w-12 h-12 text-blue-600 mr-4" />
                <h1 className="text-5xl font-bold">
                  Blog <span className="text-blue-600">FinNEXTHO</span>
                </h1>
              </div>
              <p className={`text-xl max-w-3xl mx-auto mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Conteúdo exclusivo sobre educação financeira, investimentos, tecnologia e tendências do mercado. 
                Evolua suas finanças com conhecimento de qualidade.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div 
              className="max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Buscar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : resolvedTheme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{category.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : resolvedTheme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden mb-16`}
            >
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="h-64 md:h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <FiTrendingUp className="w-24 h-24 text-white" />
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mr-3">
                      Destaque
                    </span>
                    <span className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{featuredPost.title}</h2>
                  <p className={`text-lg mb-6 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {featuredPost.excerpt}
                  </p>
                  <div className={`flex items-center text-sm mb-6 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FiUser className="w-4 h-4 mr-2" />
                    <span className="mr-4">{featuredPost.author}</span>
                    <FiCalendar className="w-4 h-4 mr-2" />
                    <span className="mr-4">{featuredPost.date}</span>
                    <FiClock className="w-4 h-4 mr-2" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center">
                    Ler Artigo
                    <FiArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer`}
                >
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <post.icon className="w-16 h-16 text-white" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <FiTag className={`w-4 h-4 mr-2 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {post.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                    <p className={`text-sm mb-4 line-clamp-3 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {post.excerpt}
                    </p>
                    <div className={`flex items-center text-xs mb-4 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FiUser className="w-3 h-3 mr-1" />
                      <span className="mr-3">{post.author}</span>
                      <FiCalendar className="w-3 h-3 mr-1" />
                      <span className="mr-3">{post.date}</span>
                      <FiClock className="w-3 h-3 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                    <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center">
                      Ler mais
                      <FiArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-12 shadow-lg`}
            >
              <FiBookOpen className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Não Perca Nenhum Artigo</h2>
              <p className={`text-lg mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Receba nossos melhores conteúdos sobre educação financeira e tecnologia diretamente no seu email.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Seu melhor email"
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Assinar
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}