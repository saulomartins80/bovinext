import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiMapPin, 
  FiDollarSign, 
  FiTrendingUp,
  FiCode,
  FiBarChart,
  FiPenTool,
  FiHeadphones,
  FiBook,
  FiHeart,
  FiCoffee,
  FiGlobe,
  FiAward,
  FiMail
} from 'react-icons/fi';
import { useState } from 'react';
import { InstitutionalHeader } from '../components/layout/InstitutionalHeader';
import { Footer } from '../components/layout/Footer';

export default function Carreiras() {
  const { resolvedTheme } = useTheme();
  const [selectedDepartment, setSelectedDepartment] = useState('todas');

  const departments = [
    { id: 'todas', label: 'Todas as Vagas', count: 8 },
    { id: 'tecnologia', label: 'Tecnologia', count: 4 },
    { id: 'produto', label: 'Produto', count: 2 },
    { id: 'financeiro', label: 'Financeiro', count: 1 },
    { id: 'marketing', label: 'Marketing', count: 1 }
  ];

  const benefits = [
    {
      icon: FiHeart,
      title: 'Plano de Saúde',
      description: 'Plano de saúde completo para você e sua família'
    },
    {
      icon: FiBook,
      title: 'Educação',
      description: 'Auxílio educação e cursos de capacitação'
    },
    {
      icon: FiCoffee,
      title: 'Flexibilidade',
      description: 'Horário flexível e trabalho remoto'
    },
    {
      icon: FiTrendingUp,
      title: 'Crescimento',
      description: 'Plano de carreira estruturado e mentoria'
    },
    {
      icon: FiGlobe,
      title: 'Ambiente Global',
      description: 'Trabalhe com tecnologias de ponta'
    },
    {
      icon: FiAward,
      title: 'Reconhecimento',
      description: 'Programa de bonificação por performance'
    }
  ];

  const jobs = [
    {
      id: 1,
      title: 'Desenvolvedor Full Stack Sênior',
      department: 'Tecnologia',
      location: 'São Paulo, SP',
      type: 'CLT',
      salary: 'R$ 12.000 - R$ 18.000',
      icon: FiCode,
      description: 'Desenvolver e manter aplicações web usando React, Node.js e TypeScript.',
      requirements: ['5+ anos de experiência', 'React/Node.js', 'TypeScript', 'AWS/Docker']
    },
    {
      id: 2,
      title: 'Analista de Dados Pleno',
      department: 'Tecnologia',
      location: 'São Paulo, SP',
      type: 'CLT',
      salary: 'R$ 8.000 - R$ 12.000',
      icon: FiBarChart,
      description: 'Análise de dados financeiros e criação de dashboards para insights de negócio.',
      requirements: ['3+ anos de experiência', 'Python/SQL', 'Power BI/Tableau', 'Estatística']
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      department: 'Produto',
      location: 'São Paulo, SP',
      type: 'CLT',
      salary: 'R$ 7.000 - R$ 11.000',
      icon: FiPenTool,
      description: 'Criar experiências digitais excepcionais para produtos financeiros.',
      requirements: ['3+ anos de experiência', 'Figma/Adobe XD', 'Design System', 'Prototipagem']
    },
    {
      id: 4,
      title: 'Consultor Financeiro',
      department: 'Financeiro',
      location: 'São Paulo, SP',
      type: 'CLT',
      salary: 'R$ 6.000 - R$ 10.000',
      icon: FiDollarSign,
      description: 'Atendimento especializado e consultoria financeira para clientes premium.',
      requirements: ['CPA-20 ou CFP', '2+ anos consultoria', 'Relacionamento', 'Vendas']
    },
    {
      id: 5,
      title: 'Desenvolvedor Frontend',
      department: 'Tecnologia',
      location: 'Remoto',
      type: 'CLT',
      salary: 'R$ 8.000 - R$ 14.000',
      icon: FiCode,
      description: 'Desenvolvimento de interfaces modernas e responsivas com React e Next.js.',
      requirements: ['3+ anos React', 'Next.js/TypeScript', 'Tailwind CSS', 'Testes automatizados']
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      department: 'Tecnologia',
      location: 'São Paulo, SP',
      type: 'CLT',
      salary: 'R$ 10.000 - R$ 16.000',
      icon: FiCode,
      description: 'Infraestrutura cloud, CI/CD e automação de processos de deploy.',
      requirements: ['AWS/Azure', 'Docker/Kubernetes', 'Terraform', 'CI/CD pipelines']
    },
    {
      id: 7,
      title: 'Product Manager',
      department: 'Produto',
      location: 'São Paulo, SP',
      type: 'CLT',
      salary: 'R$ 12.000 - R$ 18.000',
      icon: FiTrendingUp,
      description: 'Liderar estratégia de produto e roadmap de funcionalidades.',
      requirements: ['5+ anos produto', 'Fintech experience', 'Analytics', 'Liderança']
    },
    {
      id: 8,
      title: 'Estagiário Marketing Digital',
      department: 'Marketing',
      location: 'São Paulo, SP',
      type: 'Estágio',
      salary: 'R$ 1.500 + benefícios',
      icon: FiHeadphones,
      description: 'Apoio em campanhas digitais, redes sociais e análise de métricas.',
      requirements: ['Cursando Marketing/Publicidade', 'Redes sociais', 'Google Analytics', 'Criatividade']
    }
  ];

  const filteredJobs = jobs.filter(job => {
    return selectedDepartment === 'todas' || job.department.toLowerCase().includes(selectedDepartment);
  });

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Carreiras | Finnextho - Trabalhe Conosco</title>
        <meta name="description" content="Faça parte do time Finnextho. Vagas em tecnologia, produto, financeiro e marketing. Ambiente inovador e benefícios excepcionais." />
      </Head>
      
      <InstitutionalHeader 
        title="Carreiras" 
        icon={<FiUsers className="w-6 h-6 text-blue-500" />}
        breadcrumb="Carreiras"
      />
      
      <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>

        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center mb-6">
                <FiUsers className="w-12 h-12 text-blue-600 mr-4" />
                <h1 className="text-5xl font-bold">
                  Carreiras na <span className="text-blue-600">Finnextho</span>
                </h1>
              </div>
              <p className={`text-xl max-w-3xl mx-auto mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Faça parte da revolução financeira. Junte-se ao nosso time de inovadores e 
                ajude a transformar a relação das pessoas com o dinheiro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Ver Todas as Vagas
                </button>
                <button className={`px-8 py-3 rounded-lg font-semibold border-2 transition-colors ${
                  resolvedTheme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                  Enviar Currículo
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Por que Trabalhar na Finnextho?</h2>
              <p className={`text-lg ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Oferecemos um ambiente de trabalho excepcional com benefícios únicos
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg text-center`}
                >
                  <benefit.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className={`${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Department Filter */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                    selectedDepartment === dept.id
                      ? 'bg-blue-600 text-white'
                      : resolvedTheme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{dept.label}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedDepartment === dept.id
                      ? 'bg-blue-500 text-white'
                      : resolvedTheme === 'dark'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {dept.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Jobs Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <job.icon className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <p className={`text-sm ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {job.department}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.type === 'CLT' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {job.type}
                    </span>
                  </div>

                  <p className={`mb-4 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {job.description}
                  </p>

                  <div className="flex items-center mb-4 text-sm">
                    <FiMapPin className={`w-4 h-4 mr-2 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`mr-4 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{job.location}</span>
                    <FiDollarSign className={`w-4 h-4 mr-2 ${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`${resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{job.salary}</span>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Requisitos:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, idx) => (
                        <span 
                          key={idx}
                          className={`px-3 py-1 rounded-full text-xs ${
                            resolvedTheme === 'dark' 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Candidatar-se
                  </button>
                </motion.div>
              ))}
            </div>
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
              <FiMail className="w-16 h-16 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Não Encontrou a Vaga Ideal?</h2>
              <p className={`text-lg mb-8 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Envie seu currículo mesmo assim! Estamos sempre em busca de talentos excepcionais 
                para fazer parte do nosso time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:carreiras@Finnextho.com" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Enviar Currículo
                </a>
                <Link 
                  href="/contato" 
                  className={`px-8 py-3 rounded-lg font-semibold border-2 transition-colors ${
                    resolvedTheme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Falar Conosco
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
