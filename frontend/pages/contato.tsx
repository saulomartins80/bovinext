import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Footer } from '../components/layout/Footer';
import { ClientHeader } from '../components/layout/ClientHeader';
import { useTheme } from '../context/ThemeContext';
import SEOHead from '../components/SEOHead';
import { 
  FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiUser, 
  FiHeadphones, FiZap, FiCheck,
  FiLinkedin, FiTwitter, FiInstagram, FiYoutube
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';

export default function Contato() {
  const { resolvedTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    contactPreference: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio do formulário
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        contactPreference: 'email'
      });
    } catch (error) {
      setSubmitStatus('error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiMail className="w-6 h-6" />,
      title: 'Email',
      value: 'suporte@Finnextho.com',
      description: 'Resposta em até 2 horas',
      action: 'mailto:suporte@Finnextho.com'
    },
    {
      icon: <FiPhone className="w-6 h-6" />,
      title: 'Telefone',
      value: '+55 (62) 99966-7963',
      description: 'Seg-Sex, 9h às 17h',
      action: 'tel:+5562999667963'
    },
    {
      icon: <FaWhatsapp className="w-6 h-6" />,
      title: 'WhatsApp',
      value: '+55 (62) 99966-7963',
      description: 'Suporte 24/7',
      action: 'https://wa.me/5562999667963'
    },
    {
      icon: <FiMapPin className="w-6 h-6" />,
      title: 'Endereço',
      value: 'Goiânia, GO',
      description: 'Centro Empresarial',
      action: 'https://maps.google.com'
    }
  ];

  const supportOptions = [
    {
      icon: <FiHeadphones className="w-8 h-8" />,
      title: 'Suporte Técnico',
      description: 'Ajuda com problemas técnicos e configurações',
      availability: '24/7',
      color: 'blue'
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: 'Vendas',
      description: 'Informações sobre planos e demonstrações',
      availability: 'Seg-Sex, 8h-18h',
      color: 'green'
    },
    {
      icon: <FiUser className="w-8 h-8" />,
      title: 'Consultoria',
      description: 'Consultoria financeira personalizada',
      availability: 'Agendamento',
      color: 'purple'
    }
  ];

  const faqs = [
    {
      question: 'Qual o tempo de resposta?',
      answer: 'Respondemos emails em até 2 horas durante horário comercial e WhatsApp 24/7.'
    },
    {
      question: 'Oferecem demonstração gratuita?',
      answer: 'Sim! Oferecemos demonstração personalizada de 30 minutos para conhecer suas necessidades.'
    },
    {
      question: 'Como funciona o suporte técnico?',
      answer: 'Temos suporte 24/7 via chat, email e telefone. Clientes Enterprise têm suporte prioritário.'
    },
    {
      question: 'Posso agendar uma reunião?',
      answer: 'Claro! Use nosso formulário ou WhatsApp para agendar uma reunião com nossos especialistas.'
    }
  ];

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <SEOHead
        title="Contato - Fale Conosco"
        description="Entre em contato com a equipe FinNEXTHO. Tire suas dúvidas, solicite demonstrações e conheça nossas soluções de gestão financeira."
        keywords="contato finnextho, fale conosco, suporte, demonstração, atendimento, contato comercial"
        canonical="/contato"
      />
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
              Vamos <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Conversar</span>?
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Estamos aqui para ajudar você a transformar suas finanças. Entre em contato conosco!
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.a
                key={index}
                href={info.action}
                target={info.action.startsWith('http') ? '_blank' : '_self'}
                rel={info.action.startsWith('http') ? 'noopener noreferrer' : ''}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white mb-4`}>
                  {info.icon}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {info.title}
                </h3>
                <p className={`font-medium mb-1 ${
                  resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {info.value}
                </p>
                <p className={`text-sm ${
                  resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {info.description}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Support Options */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Envie sua Mensagem
              </h2>
              <p className={`text-lg mb-8 ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Preencha o formulário e nossa equipe entrará em contato em breve.
              </p>

              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center">
                  <FiCheck className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-green-800">Mensagem enviada com sucesso! Entraremos em contato em breve.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <span className="text-red-800">Erro ao enviar mensagem. Tente novamente ou use outro meio de contato.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        resolvedTheme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        resolvedTheme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        resolvedTheme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Empresa
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        resolvedTheme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Assunto *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="demo">Solicitar Demonstração</option>
                    <option value="support">Suporte Técnico</option>
                    <option value="sales">Informações de Vendas</option>
                    <option value="partnership">Parcerias</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Mensagem *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Descreva como podemos ajudá-lo..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Preferência de Contato
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contactPreference"
                        value="email"
                        checked={formData.contactPreference === 'email'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600"
                      />
                      <span className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Email
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contactPreference"
                        value="phone"
                        checked={formData.contactPreference === 'phone'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600"
                      />
                      <span className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        Telefone
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contactPreference"
                        value="whatsapp"
                        checked={formData.contactPreference === 'whatsapp'}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600"
                      />
                      <span className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        WhatsApp
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transform hover:scale-105'
                  } text-white`}
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      Enviar Mensagem <FiSend className="inline ml-2" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Support Options */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
                resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Como Podemos Ajudar?
              </h2>
              <p className={`text-lg mb-8 ${
                resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Escolha a melhor forma de entrar em contato conosco.
              </p>

              <div className="space-y-6">
                {supportOptions.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                      resolvedTheme === 'dark' 
                        ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${
                        option.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        option.color === 'green' ? 'from-green-500 to-green-600' :
                        'from-purple-500 to-purple-600'
                      } flex items-center justify-center text-white mr-4 flex-shrink-0`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-semibold mb-2 ${
                          resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {option.title}
                        </h3>
                        <p className={`mb-2 ${
                          resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {option.description}
                        </p>
                        <p className={`text-sm font-medium ${
                          resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <FiClock className="inline w-4 h-4 mr-1" />
                          {option.availability}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-12">
                <h3 className={`text-xl font-semibold mb-4 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Siga-nos nas Redes Sociais
                </h3>
                <div className="flex space-x-4">
                  {[
                    { icon: <FiLinkedin />, href: '#', color: 'text-blue-600' },
                    { icon: <FiTwitter />, href: '#', color: 'text-blue-400' },
                    { icon: <FiInstagram />, href: '#', color: 'text-pink-500' },
                    { icon: <FiYoutube />, href: '#', color: 'text-red-500' }
                  ].map((social, index) => (
                    <Link
                      key={index}
                      href={social.href}
                      className={`w-12 h-12 rounded-xl border transition-all duration-300 hover:scale-110 flex items-center justify-center ${
                        resolvedTheme === 'dark' 
                          ? 'border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white' 
                          : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-6">
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
              Perguntas <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Frequentes</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-6 rounded-xl border ${
                  resolvedTheme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-3 ${
                  resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {faq.question}
                </h3>
                <p className={resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
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
              Pronto para Começar?
            </h2>
            <p className={`text-xl mb-8 ${
              resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Agende uma demonstração gratuita e veja como podemos transformar suas finanças.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Começar Gratuitamente <FiZap className="inline ml-2" />
              </Link>
              <Link href="https://wa.me/5511999999999" className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all duration-300 ${
                resolvedTheme === 'dark' 
                  ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900'
              }`}>
                <FaWhatsapp className="inline mr-2" />
                WhatsApp
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
