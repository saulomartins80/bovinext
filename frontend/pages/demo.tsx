import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Footer } from '../components/layout/Footer';
import { ClientHeader } from '../components/layout/ClientHeader';
import { useTheme } from '../context/ThemeContext';
import { 
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiDownload,
  FiCheck, FiArrowRight, FiZap, FiStar,
  FiSmartphone, FiMonitor, FiTablet
} from 'react-icons/fi';
import { FaRobot, FaChartLine, FaMobile } from 'react-icons/fa';
import Link from 'next/link';

export default function Demo() {
  const { resolvedTheme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeDemo, setActiveDemo] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const demoFeatures = [
    {
      title: 'Dashboard Inteligente',
      description: 'Visualize todas suas finanças em tempo real com gráficos interativos e insights personalizados.',
      icon: <FaChartLine className="w-8 h-8" />,
      color: 'blue',
      video: '/demos/dashboard.mp4',
      highlights: [
        'Gráficos em tempo real',
        'Widgets personalizáveis',
        'Análise de tendências',
        'Alertas inteligentes'
      ]
    },
    {
      title: 'IA Preditiva',
      description: 'Algoritmos avançados que preveem tendências e sugerem as melhores decisões financeiras.',
      icon: <FaRobot className="w-8 h-8" />,
      color: 'purple',
      video: '/demos/ai.mp4',
      highlights: [
        'Previsões precisas',
        'Recomendações personalizadas',
        'Análise de padrões',
        'Otimização automática'
      ]
    },
    {
      title: 'App Mobile',
      description: 'Acesse suas finanças em qualquer lugar com nosso app nativo para iOS e Android.',
      icon: <FaMobile className="w-8 h-8" />,
      color: 'green',
      video: '/demos/mobile.mp4',
      highlights: [
        'Interface nativa',
        'Sincronização em tempo real',
        'Notificações push',
        'Modo offline'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'CEO, TechStart',
      content: 'A demonstração me convenceu em 5 minutos. A IA realmente funciona!',
      rating: 5,
      avatar: '/avatars/carlos.jpg'
    },
    {
      name: 'Ana Santos',
      role: 'Investidora',
      content: 'Interface incrível e recursos que realmente fazem diferença no dia a dia.',
      rating: 5,
      avatar: '/avatars/ana.jpg'
    },
    {
      name: 'Roberto Costa',
      role: 'Empresário',
      content: 'Migrei após ver a demo. Melhor decisão que tomei para minhas finanças.',
      rating: 5,
      avatar: '/avatars/roberto.jpg'
    }
  ];

  const stats = [
    { value: '98%', label: 'Satisfação após Demo' },
    { value: '5min', label: 'Tempo Médio de Demo' },
    { value: '10k+', label: 'Demos Realizadas' },
    { value: '4.9/5', label: 'Avaliação Média' }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Demonstração Interativa | FinNEXTHO</title>
        <meta name="description" content="Veja o FinNEXTHO em ação! Demonstração completa com vídeos interativos e recursos em tempo real." />
        <meta property="og:title" content="Demonstração Interativa | FinNEXTHO" />
        <meta property="og:description" content="Descubra como o FinNEXTHO pode transformar suas finanças" />
        <meta property="og:video" content="/demos/hero-demo.mp4" />
      </Head>

      <ClientHeader />
      
      {/* Hero Section with Video */}
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
              Veja o FinNEXTHO <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">em Ação</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Demonstração completa da plataforma que está revolucionando a gestão financeira
            </p>
          </motion.div>

          {/* Main Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`relative rounded-2xl overflow-hidden shadow-2xl border-4 ${
              resolvedTheme === 'dark' ? 'border-gray-700' : 'border-white'
            }`}
          >
            <video
              ref={videoRef}
              className="w-full h-auto"
              poster="/demos/hero-poster.jpg"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="/demos/hero-demo.mp4" type="video/mp4" />
              Seu navegador não suporta vídeos HTML5.
            </video>
            
            {/* Video Controls */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                  >
                    {isPlaying ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6 ml-1" />}
                  </button>
                  
                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
                  >
                    {isMuted ? <FiVolumeX className="w-5 h-5" /> : <FiVolume2 className="w-5 h-5" />}
                  </button>
                  
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300">
                    <FiDownload className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300">
                    <FiMaximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
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

      {/* Interactive Demo Features */}
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
              Explore os <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recursos</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Clique nos recursos abaixo para ver demonstrações específicas
            </p>
          </motion.div>

          {/* Demo Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {demoFeatures.map((feature, index) => (
              <button
                key={index}
                onClick={() => setActiveDemo(index)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeDemo === index
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : resolvedTheme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {/* Active Demo Content */}
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${
                demoFeatures[activeDemo].color === 'blue' ? 'from-blue-500 to-blue-600' :
                demoFeatures[activeDemo].color === 'purple' ? 'from-purple-500 to-purple-600' :
                'from-green-500 to-green-600'
              } flex items-center justify-center text-white mb-6`}>
                {demoFeatures[activeDemo].icon}
              </div>
              
              <h3 className={`text-3xl font-bold mb-4 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {demoFeatures[activeDemo].title}
              </h3>
              
              <p className={`text-lg mb-6 ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {demoFeatures[activeDemo].description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {demoFeatures[activeDemo].highlights.map((highlight, idx) => (
                  <li key={idx} className={`flex items-center ${
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <FiCheck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
              
              <Link href="/auth/register" className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Experimentar Agora <FiArrowRight className="ml-2" />
              </Link>
            </div>
            
            <div className={`rounded-2xl overflow-hidden shadow-2xl border ${
              resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
                poster={`/demos/${demoFeatures[activeDemo].title.toLowerCase().replace(' ', '-')}-poster.jpg`}
              >
                <source src={demoFeatures[activeDemo].video} type="video/mp4" />
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Device Compatibility */}
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
              Funciona em <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Todos os Dispositivos</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <FiMonitor className="w-8 h-8" />, title: 'Desktop', desc: 'Windows, Mac, Linux' },
              { icon: <FiTablet className="w-8 h-8" />, title: 'Tablet', desc: 'iPad, Android Tablets' },
              { icon: <FiSmartphone className="w-8 h-8" />, title: 'Mobile', desc: 'iOS, Android' }
            ].map((device, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-8 rounded-2xl border text-center transition-all duration-300 hover:scale-105 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mx-auto mb-4`}>
                  {device.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {device.title}
                </h3>
                <p className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {device.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
              O que Dizem Após a <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Demo</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={controls}
                variants={{
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { duration: 0.8, delay: index * 0.1 } 
                  }
                }}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                
                <p className={`text-lg mb-6 ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {testimonial.name}
                    </h4>
                    <p className={`text-sm ${
                      resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {testimonial.role}
                    </p>
                  </div>
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
              Convencido? Comece Agora!
            </h2>
            <p className={`text-xl mb-8 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Teste grátis por 14 dias. Sem cartão de crédito, sem compromisso.
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
                Agendar Demo Personalizada
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
