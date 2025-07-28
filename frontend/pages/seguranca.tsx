import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiLock, 
  FiShield, 
  FiEye, 
  FiKey, 
  FiServer,
  FiCheckCircle,
  FiAlertTriangle,
  FiUsers,
  FiClock,
  FiAward
} from 'react-icons/fi';

export default function Seguranca() {
  const { resolvedTheme } = useTheme();

  const securityFeatures = [
    {
      icon: FiLock,
      title: 'Criptografia AES-256',
      description: 'Todos os dados são criptografados com o mais alto padrão de segurança da indústria.'
    },
    {
      icon: FiKey,
      title: 'Autenticação Multifator',
      description: 'Proteção adicional com 2FA, biometria e tokens de segurança.'
    },
    {
      icon: FiEye,
      title: 'Monitoramento 24/7',
      description: 'Equipe dedicada monitora atividades suspeitas em tempo real.'
    },
    {
      icon: FiServer,
      title: 'Infraestrutura Segura',
      description: 'Servidores em data centers certificados com redundância e backup.'
    },
    {
      icon: FiShield,
      title: 'Conformidade LGPD',
      description: 'Total conformidade com a Lei Geral de Proteção de Dados.'
    },
    {
      icon: FiUsers,
      title: 'Controle de Acesso',
      description: 'Permissões granulares e auditoria completa de acessos.'
    }
  ];

  const certifications = [
    {
      title: 'ISO 27001',
      description: 'Certificação internacional de segurança da informação'
    },
    {
      title: 'PCI DSS',
      description: 'Padrão de segurança para dados de cartão de crédito'
    },
    {
      title: 'SOC 2 Type II',
      description: 'Auditoria de controles de segurança e disponibilidade'
    },
    {
      title: 'LGPD Compliant',
      description: 'Conformidade total com a legislação brasileira'
    }
  ];

  const securityPractices = [
    'Testes de penetração regulares por empresas especializadas',
    'Backup automático e criptografado em múltiplas localizações',
    'Logs de auditoria detalhados de todas as atividades',
    'Treinamento contínuo da equipe em segurança cibernética',
    'Políticas rigorosas de acesso e controle de privilégios',
    'Monitoramento proativo de ameaças e vulnerabilidades'
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Segurança | FinNEXTHO - Proteção de Dados e Privacidade</title>
        <meta name="description" content="Conheça as medidas de segurança da FinNEXTHO. Criptografia AES-256, monitoramento 24/7, conformidade LGPD e certificações internacionais." />
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
              <div className="flex items-center justify-center mb-6">
                <FiShield className="w-12 h-12 text-blue-600 mr-4" />
                <h1 className="text-5xl font-bold">
                  Segurança <span className="text-blue-600">FinNEXTHO</span>
                </h1>
              </div>
              <p className={`text-xl max-w-3xl mx-auto mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Sua segurança é nossa prioridade máxima. Utilizamos as mais avançadas tecnologias 
                e práticas de segurança para proteger seus dados e transações financeiras.
              </p>
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span>Criptografia AES-256</span>
                </div>
                <div className="flex items-center">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span>Conformidade LGPD</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Recursos de Segurança</h2>
              <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Tecnologias de ponta para proteger suas informações financeiras
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}
                >
                  <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Certificações e Conformidade</h2>
              <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Reconhecimento internacional dos nossos padrões de segurança
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg text-center`}
                >
                  <FiAward className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{cert.title}</h3>
                  <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {cert.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Practices */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl font-bold mb-6">Práticas de Segurança</h2>
                <p className={`text-lg mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Implementamos as melhores práticas da indústria para garantir 
                  a proteção contínua dos seus dados financeiros.
                </p>
                <ul className="space-y-4">
                  {securityPractices.map((practice, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <FiCheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {practice}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-lg`}
              >
                <div className="text-center mb-6">
                  <FiClock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Monitoramento 24/7</h3>
                  <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Nossa equipe de segurança trabalha ininterruptamente
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">99.9%</div>
                    <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Uptime</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">&lt;1s</div>
                    <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Detecção</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">24/7</div>
                    <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Suporte</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">0</div>
                    <div className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Incidentes</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-12 shadow-lg`}
            >
              <FiAlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Reporte Problemas de Segurança</h2>
              <p className={`text-lg mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Encontrou alguma vulnerabilidade ou problema de segurança? 
                Entre em contato imediatamente com nossa equipe especializada.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:security@finnextho.com" 
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Reportar Vulnerabilidade
                </a>
                <Link 
                  href="/contato" 
                  className={`px-8 py-3 rounded-lg font-semibold border-2 transition-colors ${
                    resolvedTheme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Suporte Geral
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}