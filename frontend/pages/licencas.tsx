import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiFileText, 
  FiCode, 
  FiHeart, 
  FiShield, 
  FiGlobe,
  FiExternalLink,
  FiGithub,
  FiBook,
  FiMail
} from 'react-icons/fi';
import { useState } from 'react';

export default function Licencas() {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('software');

  const softwareLicenses = [
    {
      name: 'React',
      version: '18.2.0',
      license: 'MIT',
      description: 'Biblioteca JavaScript para construção de interfaces de usuário',
      url: 'https://reactjs.org/',
      author: 'Meta (Facebook)'
    },
    {
      name: 'Next.js',
      version: '14.0.0',
      license: 'MIT',
      description: 'Framework React para produção com renderização server-side',
      url: 'https://nextjs.org/',
      author: 'Vercel'
    },
    {
      name: 'TypeScript',
      version: '5.0.0',
      license: 'Apache 2.0',
      description: 'Superset tipado do JavaScript',
      url: 'https://www.typescriptlang.org/',
      author: 'Microsoft'
    },
    {
      name: 'Tailwind CSS',
      version: '3.3.0',
      license: 'MIT',
      description: 'Framework CSS utility-first',
      url: 'https://tailwindcss.com/',
      author: 'Tailwind Labs'
    },
    {
      name: 'Framer Motion',
      version: '10.16.0',
      license: 'MIT',
      description: 'Biblioteca de animações para React',
      url: 'https://www.framer.com/motion/',
      author: 'Framer'
    },
    {
      name: 'React Icons',
      version: '4.11.0',
      license: 'MIT',
      description: 'Ícones populares como componentes React',
      url: 'https://react-icons.github.io/react-icons/',
      author: 'React Icons Team'
    }
  ];

  const contentLicenses = [
    {
      type: 'Imagens',
      source: 'Unsplash',
      license: 'Unsplash License',
      description: 'Fotos de alta qualidade gratuitas para uso comercial',
      url: 'https://unsplash.com/license'
    },
    {
      type: 'Ícones',
      source: 'Feather Icons',
      license: 'MIT',
      description: 'Conjunto de ícones minimalistas e elegantes',
      url: 'https://feathericons.com/'
    },
    {
      type: 'Fontes',
      source: 'Google Fonts',
      license: 'Open Font License',
      description: 'Fontes web otimizadas e gratuitas',
      url: 'https://fonts.google.com/'
    },
    {
      type: 'Ilustrações',
      source: 'unDraw',
      license: 'MIT',
      description: 'Ilustrações SVG personalizáveis',
      url: 'https://undraw.co/license'
    }
  ];

  const proprietaryLicenses = [
    {
      component: 'FinNEXTHO Platform',
      license: 'Proprietária',
      description: 'Código-fonte principal da plataforma FinNEXTHO',
      rights: 'Todos os direitos reservados à FinNEXTHO Ltda.'
    },
    {
      component: 'Algoritmos de IA',
      license: 'Proprietária',
      description: 'Modelos de machine learning e algoritmos preditivos',
      rights: 'Propriedade intelectual protegida por patente'
    },
    {
      component: 'Design System',
      license: 'Proprietária',
      description: 'Identidade visual, logotipos e elementos de marca',
      rights: 'Marca registrada FinNEXTHO®'
    },
    {
      component: 'Conteúdo Editorial',
      license: 'Creative Commons BY-NC-SA',
      description: 'Artigos, tutoriais e materiais educativos',
      rights: 'Uso não comercial com atribuição'
    }
  ];

  const getLicenseColor = (license: string) => {
    const colors = {
      'MIT': resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-600',
      'Apache 2.0': resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      'Proprietária': resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      'Creative Commons BY-NC-SA': resolvedTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'
    };
    return colors[license as keyof typeof colors] || (resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600');
  };

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Licenças e Atribuições | FinNEXTHO - Open Source e Propriedade Intelectual</title>
        <meta name="description" content="Informações sobre licenças de software, atribuições, direitos autorais e propriedade intelectual da FinNEXTHO. Transparência total sobre nossas dependências." />
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
              <FiFileText className={`w-12 h-12 mr-4 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className="text-4xl md:text-5xl font-bold">
                Licenças e <span className={resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Atribuições</span>
              </h1>
            </div>
            <p className={`text-xl max-w-3xl mx-auto ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Transparência total sobre as tecnologias, licenças e atribuições que tornam a FinNEXTHO possível.
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
              { id: 'software', label: 'Software Open Source', icon: FiCode },
              { id: 'conteudo', label: 'Conteúdo e Mídia', icon: FiGlobe },
              { id: 'proprietario', label: 'Propriedade Intelectual', icon: FiShield }
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
            {/* Software Open Source */}
            {activeTab === 'software' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Software Open Source</h2>
                  <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Tecnologias e bibliotecas que utilizamos com gratidão à comunidade open source
                  </p>
                </div>
                <div className="grid gap-6">
                  {softwareLicenses.map((software, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{software.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseColor(software.license)} bg-opacity-20`}>
                              {software.license}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              v{software.version}
                            </span>
                          </div>
                          <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                            {software.description}
                          </p>
                          <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Desenvolvido por: {software.author}
                          </p>
                        </div>
                        <a 
                          href={software.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                            resolvedTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          <FiExternalLink className="w-4 h-4 mr-2" />
                          Ver Projeto
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Conteúdo e Mídia */}
            {activeTab === 'conteudo' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Conteúdo e Mídia</h2>
                  <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Recursos visuais e de conteúdo utilizados na plataforma
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {contentLicenses.map((content, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
                    >
                      <div className="flex items-center mb-4">
                        <FiGlobe className={`w-8 h-8 mr-3 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <div>
                          <h3 className="text-xl font-semibold">{content.type}</h3>
                          <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Fonte: {content.source}
                          </p>
                        </div>
                      </div>
                      <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                        {content.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLicenseColor(content.license)} bg-opacity-20`}>
                          {content.license}
                        </span>
                        <a 
                          href={content.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center text-sm font-medium transition-colors ${
                            resolvedTheme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          Ver Licença
                          <FiExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Propriedade Intelectual */}
            {activeTab === 'proprietario' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Propriedade Intelectual</h2>
                  <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Componentes proprietários e direitos autorais da FinNEXTHO
                  </p>
                </div>
                <div className="grid gap-6">
                  {proprietaryLicenses.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FiShield className={`w-6 h-6 ${resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                            <h3 className="text-xl font-semibold">{item.component}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLicenseColor(item.license)} bg-opacity-20`}>
                              {item.license}
                            </span>
                          </div>
                          <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                            {item.description}
                          </p>
                          <p className={`text-sm font-medium ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.rights}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Seção de Agradecimentos */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <div className={`${resolvedTheme === 'dark' ? 'bg-gradient-to-r from-green-900 to-blue-900' : 'bg-gradient-to-r from-green-600 to-blue-600'} rounded-lg p-8 text-white text-center`}>
              <FiHeart className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Agradecimentos à Comunidade Open Source</h2>
              <p className="text-lg mb-6 opacity-90">
                A FinNEXTHO existe graças ao trabalho incansável da comunidade open source mundial. 
                Nosso profundo agradecimento a todos os desenvolvedores que contribuem para um mundo mais aberto e colaborativo.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <a 
                  href="https://github.com/finnextho"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <FiGithub className="w-5 h-5 mr-2" />
                  Nosso GitHub
                </a>
                <a 
                  href="mailto:opensource@finnextho.com"
                  className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <FiMail className="w-5 h-5 mr-2" />
                  Contato Open Source
                </a>
              </div>
            </div>
          </motion.section>

          {/* Informações Legais */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-16"
          >
            <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-8 shadow-lg`}>
              <div className="flex items-center mb-6">
                <FiBook className={`w-8 h-8 mr-3 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className="text-2xl font-bold">Informações Legais</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3">Direitos Autorais</h3>
                  <p className={`mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    2024 FinNEXTHO Ltda. Todos os direitos reservados. O conteúdo desta plataforma, 
                    incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio e software, 
                    é propriedade da FinNEXTHO ou de seus fornecedores de conteúdo.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Uso Permitido</h3>
                  <p className={`mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    O uso de nosso conteúdo é permitido apenas para fins pessoais e não comerciais, 
                    exceto quando expressamente autorizado. Para uso comercial ou redistribuição, 
                    entre em contato conosco.
                  </p>
                </div>
              </div>
              <div className="text-center mt-8">
                <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Para questões sobre licenças, direitos autorais ou uso de conteúdo, 
                  entre em contato: <a href="mailto:licencas@finnextho.com" className={resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>licencas@finnextho.com</a>
                </p>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}