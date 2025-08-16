import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { 
  FaWhatsapp, 
  FaTimes, 
  FaUser, 
  FaHeadset, 
  FaShoppingCart,
  FaClock,
  FaCheckDouble
} from 'react-icons/fa';
import { FiSend, FiMinimize2 } from 'react-icons/fi';
import Image from 'next/image';

interface ContactOption {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  message: string;
  icon: React.ReactNode;
  status: 'online' | 'offline';
}

interface WhatsAppFloatProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  companyName?: string;
  brandColor?: string;
}

const WhatsAppFloat = ({ 
  phoneNumber = '5511999999999',
  // message = 'Olá! Gostaria de saber mais sobre o Finnextho.',
  position = 'bottom-right',
  companyName = 'Finnextho',
  // brandColor = '#10B981'
}: WhatsAppFloatProps) => {
  const { resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  // const [typingMessage, setTypingMessage] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  // const [unreadCount, setUnreadCount] = useState(1);
  const chatRef = useRef<HTMLDivElement>(null);

  // Opções de contato profissionais com fotos reais
  const contactOptions: ContactOption[] = [
    {
      id: 'sales',
      name: 'Equipe Comercial',
      role: 'Vendas e Consultoria',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face',
      phone: phoneNumber,
      message: 'Olá! Somos a equipe comercial da Finnextho. Como podemos ajudá-lo com nossos serviços financeiros?',
      icon: <FaShoppingCart className="w-4 h-4" />,
      status: 'online'
    },
    {
      id: 'support',
      name: 'Suporte Técnico',
      role: 'Assistência Especializada',
      avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=80&h=80&fit=crop&crop=face',
      phone: phoneNumber,
      message: 'Olá! Precisa de suporte técnico? Nossa equipe especializada está pronta para ajudá-lo!',
      icon: <FaHeadset className="w-4 h-4" />,
      status: 'online'
    },
    {
      id: 'general',
      name: 'Atendimento',
      role: 'Informações Gerais',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face',
      phone: phoneNumber,
      message: 'Olá! Como posso ajudá-lo com informações sobre a Finnextho?',
      icon: <FaUser className="w-4 h-4" />,
      status: 'online'
    }
  ];

  // Verificar horário de funcionamento
  const isBusinessHours = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    return day >= 1 && day <= 5 && hour >= 9 && hour <= 18;
  };

  // Atualizar horário
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulação de digitação
  useEffect(() => {
    if (isOpen && !showTyping) {
      const timer = setTimeout(() => {
        setShowTyping(true);
        // setTypingMessage('Olá! Como posso ajudá-lo hoje?');
        setTimeout(() => setShowTyping(false), 3000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showTyping]);

  const handleContactClick = (contact: ContactOption) => {
    const encodedMessage = encodeURIComponent(contact.message);
    const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'whatsapp_contact', {
        event_category: 'contact',
        event_label: contact.id,
        contact_type: contact.role,
        value: 1
      });
    }
    
    // setUnreadCount(0);
    setIsOpen(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // setUnreadCount(0);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 md:bottom-6 md:right-6',
    'bottom-left': 'bottom-4 left-4 md:bottom-6 md:left-6'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {/* Chat Window Profissional */}
        {isOpen && !isMinimized && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`mb-4 w-72 md:w-80 ${position === 'bottom-right' ? 'mr-2' : 'ml-2'}`}
          >
            <div
              className={`relative rounded-xl shadow-2xl border overflow-hidden ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-900 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Header Compacto */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                      <FaWhatsapp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{companyName}</h4>
                      <div className="flex items-center text-xs">
                        <div className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></div>
                        <span>{isBusinessHours() ? 'Online' : 'Fora do horário'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={toggleMinimize}
                      className="p-1 rounded-full hover:bg-white/20 transition-colors"
                      aria-label="Minimizar chat"
                    >
                      <FiMinimize2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={toggleChat}
                      className="p-1 rounded-full hover:bg-white/20 transition-colors"
                      aria-label="Fechar chat"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensagem de Boas-vindas Compacta */}
              <div className={`p-3 border-b ${
                resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaWhatsapp className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className={`inline-block p-2 rounded-lg rounded-tl-sm max-w-xs ${
                      resolvedTheme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-xs">
                        Olá! 👋 Como posso ajudá-lo hoje?
                      </p>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <FaCheckDouble className="w-2 h-2 mr-1 text-blue-500" />
                      <span>{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Indicador de digitação */}
                {showTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 mt-2"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaWhatsapp className="w-3 h-3 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 p-2 rounded-lg rounded-tl-sm ${
                      resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Opções de Contato com Fotos */}
              <div className={`p-3 ${
                resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
              }`}>
                <h5 className={`text-xs font-semibold mb-2 ${
                  resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>
                  Escolha seu atendimento:
                </h5>
                
                <div className="space-y-2">
                  {contactOptions.map((contact) => (
                    <motion.button
                      key={contact.id}
                      onClick={() => handleContactClick(contact)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-2 rounded-lg border transition-all duration-200 text-left ${
                        resolvedTheme === 'dark'
                          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 hover:border-green-500'
                          : 'bg-gray-50 border-gray-200 hover:bg-green-50 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <Image
                              src={contact.avatar}
                              alt={contact.name}
                              width={32}
                              height={32}
                              className="rounded-full object-cover"
                            />
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                              resolvedTheme === 'dark' ? 'border-gray-900' : 'border-white'
                            } ${
                              contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div>
                            <h6 className={`font-medium text-xs ${
                              resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {contact.name}
                            </h6>
                            <p className={`text-xs ${
                              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {contact.role}
                            </p>
                          </div>
                        </div>
                        <FiSend className={`w-3 h-3 ${
                          resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Horário de Funcionamento Compacto */}
                <div className={`mt-3 p-2 rounded-lg border ${
                  resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-1 mb-1">
                    <FaClock className={`w-3 h-3 ${
                      resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`} />
                    <span className={`text-xs font-medium ${
                      resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Horário de Atendimento
                    </span>
                  </div>
                  <p className={`text-xs ${
                    resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Seg-Sex: 9h às 18h | Sáb: 9h às 12h
                    <br />
                    <span className={isBusinessHours() ? 'text-green-600' : 'text-orange-600'}>
                      {isBusinessHours() ? '🟢 Online' : '🟡 Fora do horário'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Speech bubble tail */}
              <div 
                className={`absolute bottom-0 ${
                  position === 'bottom-right' ? 'right-4' : 'left-4'
                } w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent ${
                  resolvedTheme === 'dark' ? 'border-t-[8px] border-t-gray-900' : 'border-t-[8px] border-t-white'
                } transform translate-y-full`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main WhatsApp Button */}
      <motion.button
        onClick={toggleChat}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group"
        style={{
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
        }}
      >
        {/* Pulsing ring animation */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-green-500"
        />

        {/* WhatsApp Icon */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="whatsapp"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaWhatsapp className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: position === 'bottom-right' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: position === 'bottom-right' ? 10 : -10 }}
              className={`absolute ${
                position === 'bottom-right' ? 'right-full mr-2' : 'left-full ml-2'
              } top-1/2 transform -translate-y-1/2 px-2 py-1 ${
                resolvedTheme === 'dark'
                  ? 'bg-gray-800 text-white border border-gray-700'
                  : 'bg-gray-900 text-white'
              } text-xs rounded-lg shadow-lg whitespace-nowrap hidden md:block`}
            >
              Fale conosco
              <div 
                className={`absolute top-1/2 transform -translate-y-1/2 w-0 h-0 ${
                  position === 'bottom-right'
                    ? 'left-full border-l-[4px] border-l-gray-800 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent'
                    : 'right-full border-r-[4px] border-r-gray-800 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification badge */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-300 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppFloat;

