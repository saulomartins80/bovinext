// pages/index.tsx - VERSÃO REVOLUCIONÁRIA
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image'; 
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import CountUp from 'react-countup';
import { 
  FiArrowRight, FiCheck, FiPlay, FiStar, FiTrendingUp, 
  FiX, FiLinkedin, FiFacebook, FiInstagram, FiYoutube,
  FiMenu, FiSun, FiMoon, FiGlobe, FiShield,
  FiUsers, FiAward, FiBarChart,
  FiSmartphone, FiMonitor, FiTablet
} from 'react-icons/fi';
import { FaBitcoin, FaChartLine, FaShieldAlt, FaRocket, FaMagic } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import WhatsAppFloat from '../components/WhatsAppFloat';
// importações removidas

  // Estilos


// Componente de Partículas Flutuantes - OTIMIZADO
const FloatingParticles = () => {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 4 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1.5 h-1.5 bg-blue-500/15 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
        />
      ))}
    </div>
  );
};

// Componente de Typing Effect
const TypingEffect = ({ text, className }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <span className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-8 bg-current ml-1"
      />
    </span>
  );
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [currentTime, setCurrentTime] = useState(new Date());
  // const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // REMOVIDO - não mais necessário
  // const controls = useAnimation(); // REMOVIDO - não mais necessário
  // const ref = useRef(null); // REMOVIDO - não mais necessário
  // const isInView = useInView(ref, { once: true }); // REMOVIDO - não mais necessário

  // Redirecionar usuários logados para o dashboard - OTIMIZADO
  useEffect(() => {
    if (!loading && user) {
      console.log('[HomePage] User is logged in, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  // efeito de hora removido

  // Rastrear posição do mouse para efeitos parallax - REMOVIDO
  // const handleMouseMove = useCallback((e: MouseEvent) => {
  //   setMousePosition({
  //     x: (e.clientX / window.innerWidth) * 100,
  //     y: (e.clientY / window.innerHeight) * 100,
  //   });
  // }, []);

  // useEffect(() => {
  //   window.addEventListener('mousemove', handleMouseMove);
  //   return () => window.removeEventListener('mousemove', handleMouseMove);
  // }, [handleMouseMove]);

  const handleClick = (buttonName: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'engagement',
        event_label: buttonName
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  useEffect(() => {
    // controls.start({ // REMOVIDO - não mais necessário
    //   opacity: window.scrollY > 200 ? 1 : 0,
    //   y: window.scrollY > 200 ? 0 : 20
    // });
  }, [isScrolled]); // REMOVIDO - não mais necessário

  useEffect(() => {
    // if (isInView) { // REMOVIDO - não mais necessário
    //   controls.start('visible');
    // }
  }, []); // REMOVIDO - não mais necessário

  // Mostrar loading apenas quando está carregando
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const splideOptions = {
    type: 'loop',
    perPage: 3,
    perMove: 1,
    gap: '2rem',
    pagination: false,
    breakpoints: {
      1024: { perPage: 2 },
      640: { perPage: 1 }
    }
  };

  // Métricas dinâmicas mais impactantes
  const metrics = [
    { value: 1.1, suffix: 'K+', label: 'Usuários ativos', icon: <FiUsers className="w-6 h-6" />, color: 'text-blue-500' },
    { value: 95, suffix: '%', label: 'Satisfação', icon: <FiStar className="w-6 h-6" />, color: 'text-yellow-500' },
    { value: 4.9, suffix: '/5', label: 'Avaliação', icon: <FiAward className="w-6 h-6" />, color: 'text-green-500' },
    { value: 24, suffix: '/7', label: 'Suporte', icon: <FiShield className="w-6 h-6" />, color: 'text-purple-500' }
  ];

  // Dados em tempo real simulados
  const liveMetrics = {
    activeUsers: Math.floor(1850 + Math.sin(Date.now() / 10000) * 100),
    transactionsToday: Math.floor(15000 + Math.sin(Date.now() / 5000) * 500),
    totalVolume: '1.8B+',
    uptime: '99.9%'
  };

  // Features com design 3D e interatividade avançada
  const features = [
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Analytics com IA",
      description: "Relatórios em tempo real com machine learning para prever tendências e otimizar investimentos",
      gradient: "from-blue-500 to-cyan-500",
      preview: "📊 Dashboard interativo com gráficos em tempo real"
    },
    {
      icon: <FaBitcoin className="w-8 h-8" />,
      title: "Cripto Integrado",
      description: "Gerencie Bitcoin, Ethereum e 50+ criptomoedas junto com investimentos tradicionais",
      gradient: "from-orange-500 to-yellow-500",
      preview: "₿ Portfolio unificado cripto + tradicional"
    },
    {
      icon: <FaRocket className="w-8 h-8" />,
      title: "Automação Inteligente",
      description: "Sistema automático que identifica oportunidades e executa operações por você",
      gradient: "from-purple-500 to-pink-500",
      preview: "🤖 IA que investe automaticamente"
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Segurança Bancária",
      description: "Criptografia AES-256, autenticação biométrica e conformidade bancária total",
      gradient: "from-green-500 to-emerald-500",
      preview: "🔒 Segurança nivel bancário certificada"
    }
  ];

  // Depoimentos mais impactantes com vídeos
  const _featuredTestimonials = [
    {
      name: "Carlos Eduardo Silva",
      role: "CEO, TechStart Investimentos",
      company: "TechStart",
      image: "/api/placeholder/64/64",
      rating: 5,
      text: "O Finnextho revolucionou nossa gestão financeira. Em 6 meses, aumentamos nosso ROI em 340% com as sugestões da IA.",
      results: "ROI +340% em 6 meses",
      videoUrl: "/videos/testimonial-carlos.mp4"
    },
    {
      name: "Marina Santos",
      role: "Diretora Financeira",
      company: "InnovaCorp",
      image: "/api/placeholder/64/64",
      rating: 5,
      text: "A automação inteligente nos poupou 15 horas semanais e eliminou 95% dos erros manuais. Incrível!",
      results: "95% menos erros, 15h/semana economizadas",
      videoUrl: "/videos/testimonial-marina.mp4"
    },
    {
      name: "Roberto Mendes",
      role: "Investidor Individual",
      company: "Autônomo",
      image: "/api/placeholder/64/64",
      rating: 5,
      text: "Como pessoa física, consegui diversificar meu portfólio e ter retornos que só grandes investidores tinham acesso.",
      results: "Portfólio diversificado, +180% retorno",
      videoUrl: "/videos/testimonial-roberto.mp4"
    }
  ];

  // Dispositivos suportados
  const devices = [
    { icon: <FiSmartphone className="w-8 h-8" />, name: "Mobile", description: "iOS & Android" },
    { icon: <FiTablet className="w-8 h-8" />, name: "Tablet", description: "iPad & Android" },
    { icon: <FiMonitor className="w-8 h-8" />, name: "Desktop", description: "Windows & Mac" },
    { icon: <FiGlobe className="w-8 h-8" />, name: "Web", description: "Todos os navegadores" }
  ];

  const menuItems = [
    { name: 'Recursos', path: '/recursos' },
    { name: 'Soluções', path: '/solucoes' },
    { name: 'Comunidade', path: '/comunidade' },
    { name: 'Preços', path: '/precos' },
    { name: 'Clientes', path: '/clientes' },
    { name: 'Contato', path: '/contato' }
  ];

  // Detecta a página atual
  const currentPath = router.pathname;

  // Filtra o menu removendo a página atual
  const filteredMenuItems = menuItems.filter(item => item.path !== currentPath);

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>finnextho - Revolução Financeira com Inteligência Artificial</title>
        <meta name="description" content="Transforme sua vida financeira com IA avançada. Investimentos inteligentes, automação total e segurança bancária. Junte-se a 2.5K+ usuários que já aumentaram seu ROI em 340%." />
        <meta name="keywords" content="finnextho, gestão financeira, inteligência artificial, investimentos, IA, finanças pessoais, automação financeira" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'} />        
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="finnextho - Revolução Financeira com IA" />
        <meta property="og:description" content="Plataforma de gestão financeira com IA que já ajudou milhares de usuários a aumentar seu ROI em até 340%" />
        <meta property="og:image" content="https://finnextho.com/og-image.jpg" />
        <meta property="og:url" content="https://finnextho.com" />
        <meta property="og:site_name" content="finnextho" />
        <meta property="og:locale" content="pt_BR" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="finnextho - Revolução Financeira com IA" />
        <meta name="twitter:description" content="Plataforma de gestão financeira com IA que já ajudou milhares de usuários a aumentar seu ROI em até 340%" />
        <meta name="twitter:image" content="https://finnextho.com/og-image.jpg" />
        <meta name="twitter:site" content="@finnextho" />
        
        {/* Estrutured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "finnextho",
              "url": "https://finnextho.com",
              "logo": "https://finnextho.com/finnextho.png",
              "description": "Plataforma de gestão financeira com inteligência artificial",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+55-62-99966-7963",
                "contactType": "customer service",
                "email": "suporte@finnextho.com"
              },
              "sameAs": [
                "https://twitter.com/finnextho",
                "https://linkedin.com/company/finnextho",
                "https://instagram.com/finnextho"
              ]
            })
          }}
        />

      </Head>

      {/* Header Revolucionário */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? resolvedTheme === 'dark' 
              ? 'bg-gray-900/90 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl' 
              : 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-2xl'
            : 'bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          background: isScrolled ? undefined : `linear-gradient(135deg, ${resolvedTheme === 'dark' ? 'rgba(17, 24, 39, 0.1)' : 'rgba(255, 255, 255, 0.1)'} 0%, transparent 100%)`
        }}
      >  
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/finnextho.png" alt="Logo Finnextho" width={40} height={40} />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              fin<span className="text-blue-300">nextho</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={item.path}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 transform relative group ${
                    resolvedTheme === 'dark' 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                  onClick={() => handleClick(`nav_${item.name.toLowerCase()}`)}
                >
                  {item.name}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                resolvedTheme === 'dark' 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800/50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
              aria-label={resolvedTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            >
              {resolvedTheme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/auth/login"  
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  resolvedTheme === 'dark' 
                    ? 'text-white hover:text-blue-100' 
                    : 'text-gray-900 hover:text-gray-700'
                }`}
                onClick={() => handleClick('login_button')}
              >
                Entrar
              </Link>
              <Link 
                href="/auth/register" 
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                onClick={() => handleClick('register_button')}
              >
                Comece Agora
              </Link>
            </div>
          </div>

          <motion.button 
            className={`md:hidden p-3 rounded-xl transition-all duration-300 z-50 ${
              resolvedTheme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiX className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMenu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden absolute top-full left-0 right-0 ${
              resolvedTheme === 'dark' 
                ? 'bg-gray-900/95 backdrop-blur-md border-t border-gray-800/50' 
                : 'bg-white/95 backdrop-blur-md border-t border-gray-200/50'
            } shadow-2xl`}
          >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <nav className="flex flex-col space-y-4">
                {filteredMenuItems.map((item) => (
                  <Link 
                    key={item.path}
                    href={item.path}
                    className={`${
                      resolvedTheme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    } transition-colors font-medium text-sm uppercase tracking-wider py-2`}
                    onClick={() => {
                      handleClick(`mobile_nav_${item.name.toLowerCase()}`);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col space-y-3">
                <Link 
                  href="/auth/login"  
                  className={`px-4 py-2 text-center font-medium rounded-lg transition ${
                    resolvedTheme === 'dark' 
                      ? 'text-white hover:bg-gray-800/50' 
                      : 'text-gray-900 hover:bg-gray-100/50'
                  }`}
                  onClick={() => {
                    handleClick('mobile_login_button');
                    setMobileMenuOpen(false);
                  }}
                >
                  Entrar
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 font-medium text-white rounded-lg hover:shadow-lg transition-all duration-300 text-center text-sm"
                  onClick={() => {
                    handleClick('mobile_register_button');
                    setMobileMenuOpen(false);
                  }}
                >
                  Comece Agora
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800 flex justify-center space-x-4">
                {[
                  { icon: <FiX className="w-5 h-5" />, name: 'X', url: 'https://x.com/finnextho' },
                  { icon: <FiLinkedin className="w-5 h-5" />, name: 'LinkedIn', url: 'https://linkedin.com/company/finnextho' },
                  { icon: <FiInstagram className="w-5 h-5" />, name: 'Instagram', url: 'https://instagram.com/finnextho' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${
                      resolvedTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    } transition`}
                    aria-label={social.name}
                    onClick={() => handleClick(`mobile_social_${social.name.toLowerCase()}`)}
                  >
                    {social.icon}
                    <span className="sr-only">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section Cinematográfico */}
      <section className={`relative min-h-screen overflow-hidden pt-32 md:pt-36 ${
        resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Background Dinâmico com Gradiente Animado */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 bg-gradient-to-br ${
            resolvedTheme === 'dark' 
              ? 'from-gray-900 via-blue-900/20 to-purple-900/30' 
              : 'from-gray-50 via-blue-50/50 to-purple-50/70'
          }`}></div>
          
          {/* Partículas Flutuantes */}
          <FloatingParticles />
          
          {/* Efeito Parallax com Mouse - REMOVIDO PARA EVITAR CONFLITOS */}
          {/* <motion.div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
              zIndex: -1
            }}
          /> */}
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto w-full"
          >
            {/* Badge "Versão PRO Lançada" - POSICIONADO CORRETAMENTE */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full ${
              resolvedTheme === 'dark' 
                ? 'bg-gray-800/50 border border-gray-700' 
                : 'bg-blue-50 border border-blue-200'
            } mb-6`}>
              <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
                Versão PRO Lançada
              </span>
            </div>

            <h1 className={`text-4xl md:text-7xl font-bold leading-tight mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <TypingEffect 
                text="Transforme suas finanças com IA"
                className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 block"
              />
              <span className={resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'}>
                e alcance a liberdade financeira
              </span>
            </h1>

            <motion.p 
              className={`text-xl md:text-2xl max-w-2xl mb-8 ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3, duration: 0.8 }}
            >
              A primeira plataforma que combina gestão financeira pessoal com inteligência artificial preditiva. 
              <strong className="text-blue-400">Junte-se a {liveMetrics.activeUsers.toLocaleString()}+ usuários ativos!</strong>
            </motion.p>
            
            {/* Métricas em Tempo Real */}
            <motion.div 
              className="flex flex-wrap gap-6 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.5, duration: 0.8 }}
            >
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                resolvedTheme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'
              }`}>
                <FiTrendingUp className="w-5 h-5 text-green-500" />
                <span className={`text-sm font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {liveMetrics.transactionsToday.toLocaleString()} transações hoje
                </span>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                resolvedTheme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'
              }`}>
                <FiBarChart className="w-5 h-5 text-blue-500" />
                <span className={`text-sm font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  R$ {liveMetrics.totalVolume} gerenciados
                </span>
              </div>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                resolvedTheme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/50 border border-gray-200'
              }`}>
                <FiShield className="w-5 h-5 text-purple-500" />
                <span className={`text-sm font-medium ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {liveMetrics.uptime} uptime
                </span>
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4, duration: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white rounded-2xl font-bold hover:shadow-2xl transition-all duration-500 transform group relative overflow-hidden text-sm md:text-base"
                  onClick={() => handleClick('hero_cta')}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <span className="relative z-10 flex items-center">
                    <FaRocket className="mr-2 md:mr-3 w-4 h-4 md:w-5 md:h-5" />
                    Começar Agora
                    <FiArrowRight className="ml-2 md:ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <button 
                  className={`flex items-center justify-center px-8 py-4 md:px-10 md:py-5 rounded-2xl font-bold transition-all duration-500 border-2 group relative overflow-hidden text-sm md:text-base ${
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-800/50 text-white hover:bg-gray-700/50 border-gray-600 hover:border-blue-400' 
                      : 'bg-white/50 text-gray-900 hover:bg-gray-50/50 border-gray-300 hover:border-blue-500'
                  }`}
                  onClick={() => {
                    handleClick('demo_button');
                    router.push('/demo');
                  }}
                >
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
                      resolvedTheme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                    }`}
                  />
                  <span className="relative z-10 flex items-center">
                    <FiPlay className="mr-2 md:mr-3 w-4 h-4 md:w-5 md:h-5" />
                    Experimentar Demo
                    <motion.div
                      className="ml-2 md:ml-3 w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </span>
                </button>
              </motion.div>
            </motion.div>
            
            {/* Indicadores de Confiança */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-8 mt-12 opacity-70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 4.5, duration: 1 }}
            >
              <div className="flex items-center space-x-2">
                <FiShield className="w-5 h-5 text-green-500" />
                <span className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>Segurança Bancária</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiUsers className="w-5 h-5 text-blue-500" />
                <span className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>1.1K+ Usuários Ativos</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiAward className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>95% Satisfação</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator Moderno - REMOVIDO COMPLETAMENTE */}
        {/* <motion.div
          animate={controls}
          initial={{ opacity: 0, y: 20 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div 
            className={`w-8 h-14 rounded-full border-2 flex justify-center p-1 cursor-pointer ${
              resolvedTheme === 'dark' ? 'border-gray-400 hover:border-blue-400' : 'border-gray-600 hover:border-blue-600'
            }`}
            whileHover={{ scale: 1.1 }}
            onClick={() => {
              document.getElementById('recursos')?.scrollIntoView({ behavior: 'smooth' });
              handleClick('scroll_indicator');
            }}
          >
            <motion.div 
              className={`w-1 h-2 rounded-full ${
                resolvedTheme === 'dark' ? 'bg-gray-400' : 'bg-gray-600'
              }`}
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          <motion.p 
            className={`text-xs mt-2 text-center ${
              resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-600'
            }`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Role para descobrir
          </motion.p>
        </motion.div> */}
      </section>

      {/* Seção de Métricas Revolucionária */}
      <section id="recursos" className={`py-24 relative overflow-hidden ${
        resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Background com Gradiente Sutil */}
        <div className={`absolute inset-0 bg-gradient-to-r opacity-5 ${
          resolvedTheme === 'dark' ? 'from-blue-600 to-purple-600' : 'from-blue-500 to-purple-500'
        }`} />
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Título da Seção */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Números que <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Impressionam</span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Resultados reais de uma plataforma que realmente funciona
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.05 }}
                className={`relative group ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600' 
                    : 'bg-white border border-gray-200/50 hover:border-gray-300 shadow-lg hover:shadow-2xl'
                } rounded-2xl p-8 text-center transition-all duration-500 cursor-pointer overflow-hidden`}
              >
                {/* Efeito de Brilho no Hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                {/* Ícone */}
                <motion.div 
                  className={`mb-4 flex justify-center ${metric.color}`}
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  {metric.icon}
                </motion.div>
                
                {/* Número */}
                <div className="text-4xl md:text-5xl font-bold mb-3 relative z-10">
                  <CountUp 
                    end={metric.value} 
                    suffix={metric.suffix}
                    duration={3}
                    decimals={metric.value % 1 ? 1 : 0}
                    className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
                  />
                </div>
                
                {/* Label */}
                <p className={`text-sm font-semibold uppercase tracking-wider relative z-10 ${
                  resolvedTheme === 'dark' ? 'text-gray-300 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                }`}>
                  {metric.label}
                </p>
                
                {/* Efeito de Partícula no Hover */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Dispositivos Suportados */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-20"
          >
            <h3 className={`text-2xl font-bold text-center mb-12 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Disponível em <span className="text-blue-500">Todos os Dispositivos</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {devices.map((device, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className={`flex flex-col items-center p-6 rounded-xl transition-all duration-300 ${
                    resolvedTheme === 'dark' 
                      ? 'bg-gray-800/30 hover:bg-gray-800/50 text-gray-300 hover:text-white' 
                      : 'bg-gray-50 hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <motion.div 
                    className="text-blue-500 mb-3"
                    whileHover={{ rotate: 10 }}
                  >
                    {device.icon}
                  </motion.div>
                  <h4 className="font-semibold text-lg mb-1">{device.name}</h4>
                  <p className="text-sm opacity-75">{device.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seção de Features Revolucionária */}
      <section id="solucoes" className={`py-24 relative overflow-hidden ${
        resolvedTheme === 'dark' ? 'bg-black' : 'bg-white'
      }`}>
        {/* Background com Efeito de Partículas */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 bg-gradient-to-br opacity-5 ${
            resolvedTheme === 'dark' ? 'from-purple-600 to-blue-600' : 'from-purple-500 to-blue-500'
          }`} />
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${
                resolvedTheme === 'dark' ? 'bg-blue-400/20' : 'bg-blue-500/20'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2 
              className={`text-4xl md:text-6xl font-bold mb-6 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Tecnologia <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Revolucionária</span>
            </motion.h2>
            <motion.p 
              className={`text-xl md:text-2xl max-w-4xl mx-auto ${
                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Recursos avançados com IA que você não encontra em nenhum outro lugar. 
              <strong className="text-blue-400">Seja o primeiro a experimentar o futuro das finanças!</strong>
            </motion.p>
          </motion.div>
          
          {/* Grid de Features 3D */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: 10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ 
                  y: -10, 
                  rotateX: 5,
                  rotateY: 5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className={`relative group p-8 rounded-3xl border transition-all duration-500 cursor-pointer overflow-hidden ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900/70' 
                    : 'bg-gray-50/50 border-gray-200 hover:border-gray-300 hover:bg-white shadow-lg hover:shadow-2xl'
                }`}
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Gradiente de Fundo */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                
                {/* Ícone com Animação */}
                <motion.div 
                  className={`mb-6 text-white p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} inline-block`}
                  whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                
                {/* Título */}
                <h3 className={`text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors duration-300 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                
                {/* Descrição */}
                <p className={`text-lg mb-6 leading-relaxed ${
                  resolvedTheme === 'dark' ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  {feature.description}
                </p>
                
                {/* Preview */}
                <motion.div 
                  className={`flex items-center space-x-3 p-4 rounded-xl ${
                    resolvedTheme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <FaMagic className="w-5 h-5 text-purple-500" />
                  <span className={`text-sm font-medium ${
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {feature.preview}
                  </span>
                </motion.div>
                
                {/* Efeito de Borda Animada */}
                <motion.div
                  className="absolute inset-0 rounded-3xl border-2 border-transparent"
                  whileHover={{
                    borderImage: `linear-gradient(45deg, ${feature.gradient.includes('blue') ? '#3b82f6' : '#8b5cf6'}, transparent, ${feature.gradient.includes('purple') ? '#8b5cf6' : '#3b82f6'}) 1`
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Seção de Demonstração Interativa - REMOVIDA */}

          <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
            <TabList className="flex flex-wrap justify-center gap-2 mb-16">
              {['Dashboard', 'Investimentos', 'Economia', 'Segurança'].map((tab, index) => (
                <Tab
                  key={index}
                  className={`px-6 py-3 rounded-full cursor-pointer font-medium transition-colors ${
                    activeTab === index
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : resolvedTheme === 'dark'
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => handleClick(`tab_${tab.toLowerCase()}`)}
                >
                  {tab}
                </Tab>
              ))}
            </TabList>

            <div className="relative">
              {[0, 1, 2, 3].map((index) => (
                <TabPanel key={index}>
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                  >
                    <div>
                      <h3 className={`text-3xl font-bold mb-6 ${
                        resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {['Painel Inteligente', 'Carteira Global', 'Automatização', 'Proteção'][index]}
                      </h3>
                      <p className={`mb-8 text-lg ${
                        resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {[
                          'Visualização unificada de todos seus ativos com recomendações em tempo real.',
                          'Gerencie ações, criptomoedas e fundos em uma única interface integrada.',
                          'Sistema automático que identifica e executa oportunidades de economia.',
                          'Tecnologia bancária militar com verificação em múltiplos fatores.'
                        ][index]}
                      </p>
                      <ul className="space-y-4">
                        {[
                          ['Análise preditiva', 'Relatórios personalizados', 'Alertas inteligentes'],
                          ['+10.000 ativos', 'Taxas competitivas', 'Estratégias automáticas'],
                          ['Identificação de gastos', 'Otimização tributária', 'Cashback inteligente'],
                          ['Criptografia AES-256', 'Biometria', 'Seguro até R$1MM']
                        ][index].map((item, i) => (
                          <li key={i} className="flex items-start">
                            <FiCheck className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                            <span className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="relative">
                      <div className={`relative rounded-2xl overflow-hidden border shadow-2xl ${
                        resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <Image
                          src={`/features/${['dashboard', 'investiments', 'savings', 'security'][index]}.jpg`}
                          alt={['Painel Financeiro', 'Investimentos', 'Economia', 'Segurança'][index]}
                          width={800}
                          height={600}
                          className="w-full h-auto"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      </div>
                    </div>
                  </motion.div>
                </TabPanel>
              ))}
            </div>
          </Tabs>
        </div>
      </section>

      {/* Seção de Depoimentos */}
      <section id="clientes" className={`py-20 ${
        resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              O que dizem nossos <span className="text-purple-400">clientes</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Veja como estamos transformando vidas financeiras
            </p>
          </div>

          <div>
            <Splide options={splideOptions} aria-label="Depoimentos">
              {_featuredTestimonials.map((testimonial, index) => (
                <SplideSlide key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-800 border-gray-700/50 hover:border-purple-500/30' 
                        : 'bg-white border-gray-200/50 hover:border-purple-500/30 shadow-lg'
                    } rounded-2xl p-8 h-full border transition-all`}
                  >
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                    <p
                      className={
                        resolvedTheme === 'dark'
                          ? 'mb-8 italic text-lg text-gray-300'
                          : 'mb-8 italic text-lg text-gray-700'
                      }
                    >
                      &quot;{testimonial.text}&quot;
                    </p>
                    <div className="flex items-center">
                      <Image
                        src={`/testimonials/client${index + 1}.jpg`}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full mr-4"
                        loading="lazy"
                      />
                      <div>
                        <h4 className={`font-bold ${
                          resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{testimonial.name}</h4>
                        <p className={`text-sm ${
                          resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.div>
                </SplideSlide>
              ))}
            </Splide>
          </div>
        </div>
      </section>

      {/* Seção CTA Final */}
      <section id="contato" className={`relative py-32 overflow-hidden ${
        resolvedTheme === 'dark' 
          ? 'bg-gradient-to-br from-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-blue-50 to-purple-50'
      }`}>
        <div className={`absolute inset-0 opacity-20 ${
          resolvedTheme === 'dark' 
            ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black'
            : 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-gray-900'
        }`}></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={`text-4xl md:text-6xl font-bold mb-8 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Pronto para a <span className={resolvedTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>revolução</span> financeira?
            </h2>
            <p className={`text-xl max-w-3xl mx-auto mb-12 ${
              resolvedTheme === 'dark' ? 'text-blue-200' : 'text-blue-900'
            }`}>
              Junte-se a mais de 5.000 usuários que já transformaram sua relação com o dinheiro.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="/auth/register"
                className={`px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center ${
                  resolvedTheme === 'dark'
                    ? 'bg-white text-blue-900 hover:bg-gray-100 hover:shadow-blue-500/20'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-blue-500/20'
                }`}
                onClick={() => handleClick('final_cta')}
              >
                Começar Gratuitamente
              </Link>

              <Link
                href="/contato"
                className={`px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center border-2 ${
                  resolvedTheme === 'dark'
                    ? 'bg-transparent border-white text-white hover:bg-white/10'
                    : 'bg-transparent border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                }`}
                onClick={() => handleClick('demo_cta')}
              >
                <FiPlay className="mr-2" />
                Falar com Especialista
              </Link>
            </div>

            <p className={`mt-8 text-sm ${
              resolvedTheme === 'dark' ? 'text-blue-300/80' : 'text-blue-800/80'
            }`}>
              Sem compromisso • Cancelamento a qualquer momento • Criptografia bancária
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className={`py-16 ${
        resolvedTheme === 'dark'
          ? 'bg-gray-950 text-gray-400'
          : 'bg-gray-100 text-gray-700'
      }`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <Image src="/finnextho.png" alt="Logo Finnextho" width={40} height={40} />
                <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 ${
                  resolvedTheme === 'dark' ? '' : 'text-gray-900'
                }`}>
                  fin<span className={resolvedTheme === 'dark' ? 'text-blue-300' : 'text-blue-700'}>nextho</span>
                </span>
              </Link>
              <p className={`mb-6 ${
                resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                A plataforma financeira mais avançada do mercado, com tecnologia de ponta para transformar sua relação com o dinheiro.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: <FiX className="w-5 h-5" />, name: 'X', url: 'https://x.com/finnextho' },
                  { icon: <FiLinkedin className="w-5 h-5" />, name: 'LinkedIn', url: 'https://linkedin.com/company/finnextho' },
                  { icon: <FiFacebook className="w-5 h-5" />, name: 'Facebook', url: 'https://facebook.com/finnextho' },
                  { icon: <FiInstagram className="w-5 h-5" />, name: 'Instagram', url: 'https://instagram.com/finnextho' },
                  { icon: <FiYoutube className="w-5 h-5" />, name: 'YouTube', url: 'https://youtube.com/finnextho' },                  
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-900'
                    }`}
                    aria-label={social.name}
                    onClick={() => handleClick(`social_${social.name.toLowerCase()}`)}
                  >
                    {social.icon}
                    <span className="sr-only">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Reorganização das colunas para mobile */}
            <div className="md:col-span-1 lg:col-span-1">
              <h3 className={`font-bold text-lg mb-6 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Produto</h3>
              <ul className="space-y-3">
                {filteredMenuItems.slice(0, 3).map((item) => (
                  <li key={item.path}>
                    <Link 
                      href={item.path}
                      className={`hover:transition-colors ${
                        resolvedTheme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                      }`}
                      onClick={() => handleClick(`footer_${item.name.toLowerCase()}`)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-1 lg:col-span-1">
              <h3 className={`font-bold text-lg mb-6 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Empresa</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Sobre', path: '/sobre' },
                  { name: 'Carreiras', path: '/carreiras' },
                  { name: 'Blog', path: '/blog' },
                  { name: 'Parceiros', path: '/parceiros' },
                  { name: 'Imprensa', path: '/imprensa' }
                ].slice(0, 3).map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.path}
                      className={`hover:transition-colors ${
                        resolvedTheme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                      }`}
                      onClick={() => handleClick(`footer_${item.name.toLowerCase()}`)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-start-1 lg:col-start-auto lg:col-span-1">
              <h3 className={`font-bold text-lg mb-6 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Jurídico</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Privacidade', path: '/privacidade' },
                  { name: 'Termos', path: '/termos' },
                  { name: 'Segurança', path: '/seguranca' },
                  { name: 'Cookies', path: '/cookies' },
                  { name: 'Licenças', path: '/licencas' }
                ].slice(0, 3).map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.path}
                      className={`hover:transition-colors ${
                        resolvedTheme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                      }`}
                      onClick={() => handleClick(`footer_${item.name.toLowerCase()}`)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`border-t mt-16 pt-8 flex flex-col md:flex-row justify-between items-center ${
            resolvedTheme === 'dark' ? 'border-gray-800' : 'border-gray-300'
          }`}>
            <p className={resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              &copy; {new Date().getFullYear()} finnextho. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link 
                href="/termos" 
                className={`hover:transition-colors ${
                  resolvedTheme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}
                onClick={() => handleClick('footer_terms')}
              >
                Termos de Serviço
              </Link>
              <Link 
                href="/privacidade" 
                className={`hover:transition-colors ${
                  resolvedTheme === 'dark' ? 'hover:text-white' : 'hover:text-gray-900'
                }`}
                onClick={() => handleClick('footer_privacy')}
              >
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* WhatsApp Float Button - apenas para usuários não logados */}
      {!loading && !user && (
        <WhatsAppFloat 
          phoneNumber="5562999667963" 
          message="Olá! Gostaria de saber mais sobre o finnextho e como ele pode me ajudar com minhas finanças."
          position="bottom-right"
        />
      )}
    </div>
  );
}
