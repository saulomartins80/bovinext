import React, { useEffect } from 'react';
import Head from 'next/head';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Footer } from '../components/layout/Footer';
import { ClientHeader } from '../components/layout/ClientHeader';
import { useTheme } from '../context/ThemeContext';
import { 
  FiStar, FiTrendingUp, FiUsers, FiDollarSign, FiArrowRight, FiCheck, FiZap
} from 'react-icons/fi';
import { FaQuoteLeft, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Link from 'next/link';

export default function Clientes() {
  const { resolvedTheme } = useTheme();
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  const stats = [
    { value: '500+', label: 'Clientes Ativos', icon: <FiUsers /> },
    { value: 'R$ 2.5B+', label: 'Patrimônio Gerenciado', icon: <FiDollarSign /> },
    { value: '98%', label: 'Satisfação', icon: <FiStar /> },
    { value: '35%', label: 'Economia Média', icon: <FiTrendingUp /> }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Carlos Eduardo Silva',
      role: 'CEO',
      company: 'TechStart Brasil',
      avatar: '/avatars/carlos.jpg',
      content: 'O FinNEXTHO revolucionou nossa gestão financeira. Com a IA preditiva, conseguimos identificar oportunidades que aumentaram nossos investimentos em 42% no último ano. A plataforma é intuitiva e o suporte é excepcional.',
      rating: 5,
      results: 'Aumento de 42% nos investimentos',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      id: 2,
      name: 'Ana Beatriz Santos',
      role: 'Diretora Financeira',
      company: 'Grupo Inovação',
      avatar: '/avatars/ana.jpg',
      content: 'Finalmente encontramos uma plataforma que unifica todos nossos investimentos globais com análises realmente úteis. O dashboard executivo nos dá visibilidade total em tempo real.',
      rating: 5,
      results: 'Redução de 60% no tempo de análise',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      id: 3,
      name: 'Roberto Costa',
      role: 'Investidor Profissional',
      company: 'Costa Investimentos',
      avatar: '/avatars/roberto.jpg',
      content: 'O sistema de economia automática já me poupou mais de R$ 25.000 em gastos desnecessários este ano. A IA identifica padrões que eu nunca percebi sozinho.',
      rating: 5,
      results: 'Economia de R$ 25.000 anuais',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      id: 4,
      name: 'Juliana Martins',
      role: 'Empreendedora',
      company: 'StartupHub',
      avatar: '/avatars/juliana.jpg',
      content: 'Migrei de outra plataforma e a diferença é absurda. O suporte 24/7 resolveu um problema crítico em minutos. A integração com APIs bancárias é perfeita.',
      rating: 5,
      results: 'Migração sem interrupções',
      social: { linkedin: '#', twitter: '#' }
    }
  ];

  const caseStudies = [
    {
      id: 1,
      company: 'TechCorp Brasil',
      industry: 'Tecnologia',
      challenge: 'Gestão descentralizada de investimentos',
      solution: 'Dashboard unificado com IA preditiva',
      results: [
        'Aumento de 45% na rentabilidade',
        'Redução de 70% no tempo de análise',
        'Visibilidade completa do portfólio'
      ],
      logo: '/logos/techcorp.png'
    },
    {
      id: 2,
      company: 'Grupo Financeiro SP',
      industry: 'Serviços Financeiros',
      challenge: 'Análise manual de riscos',
      solution: 'Automação com Machine Learning',
      results: [
        'Redução de 80% nos riscos',
        'Economia de R$ 2M anuais',
        'Decisões 5x mais rápidas'
      ],
      logo: '/logos/gruposp.png'
    },
    {
      id: 3,
      company: 'StartupHub',
      industry: 'Inovação',
      challenge: 'Controle de gastos operacionais',
      solution: 'Sistema de economia inteligente',
      results: [
        'Economia de 35% nos custos',
        'Metas alcançadas 3x mais rápido',
        'ROI de 300% em 6 meses'
      ],
      logo: '/logos/startuphub.png'
    }
  ];

  const clientLogos = [
    { name: 'TechCorp', logo: '/logos/techcorp.png' },
    { name: 'Grupo SP', logo: '/logos/gruposp.png' },
    { name: 'StartupHub', logo: '/logos/startuphub.png' },
    { name: 'InvestPro', logo: '/logos/investpro.png' },
    { name: 'FinanceMax', logo: '/logos/financemax.png' },
    { name: 'CryptoTech', logo: '/logos/cryptotech.png' }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Clientes e Cases de Sucesso | FinNEXTHO</title>
        <meta name="description" content="Descubra como nossos clientes transformaram suas finanças com o FinNEXTHO. Cases reais, resultados comprovados." />
        <meta property="og:title" content="Clientes e Cases de Sucesso | FinNEXTHO" />
        <meta property="og:description" content="Cases reais de sucesso com resultados comprovados" />
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
              Clientes que <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Confiam</span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Descubra como empresas e investidores transformaram suas finanças com resultados comprovados
            </p>
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
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mx-auto mb-4`}>
                  {stat.icon}
                </div>
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

      {/* Client Logos */}
      <section className={`py-16 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className={`text-3xl font-bold mb-4 ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Empresas que Confiam no FinNEXTHO
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {clientLogos.map((client, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-lg transition-all duration-300 hover:scale-105 ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className={`font-bold text-white text-sm ${
                    client.name.length > 8 ? 'text-xs' : 'text-sm'
                  }`}>
                    {client.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
              O que Nossos Clientes Dizem
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Depoimentos reais de quem transformou suas finanças conosco
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
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
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-6">
                  <FaQuoteLeft className="text-blue-500 text-2xl mr-4" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className={`text-lg mb-6 leading-relaxed ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {testimonial.content}
                </p>
                
                <div className={`p-4 rounded-lg mb-6 ${
                  resolvedTheme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center">
                    <FiTrendingUp className="w-5 h-5 text-green-500 mr-2" />
                    <span className={`font-semibold ${
                      resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`}>
                      Resultado: {testimonial.results}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
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
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={testimonial.social.linkedin} className="text-blue-600 hover:text-blue-700">
                      <FaLinkedin className="w-5 h-5" />
                    </Link>
                    <Link href={testimonial.social.twitter} className="text-blue-400 hover:text-blue-500">
                      <FaTwitter className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
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
              Cases de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Sucesso</span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Resultados reais e transformações comprovadas
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {caseStudies.map((caseStudy, index) => (
              <motion.div
                key={caseStudy.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-8 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-6">
                  {caseStudy.company.charAt(0)}
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {caseStudy.company}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {caseStudy.industry}
                </p>
                
                <div className="mb-6">
                  <h4 className={`font-semibold mb-2 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Desafio:
                  </h4>
                  <p className={`text-sm ${
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {caseStudy.challenge}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className={`font-semibold mb-2 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Solução:
                  </h4>
                  <p className={`text-sm ${
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {caseStudy.solution}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Resultados:
                  </h4>
                  <ul className="space-y-2">
                    {caseStudy.results.map((result, idx) => (
                      <li key={idx} className={`flex items-center text-sm ${
                        resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <FiCheck className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Ver Case Completo <FiArrowRight className="inline ml-2" />
                </button>
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
              Pronto para Ser o Próximo Case de Sucesso?
            </h2>
            <p className={`text-xl mb-8 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Junte-se a centenas de empresas que já transformaram suas finanças
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