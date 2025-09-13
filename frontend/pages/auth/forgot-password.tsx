// pages/auth/forgot-password.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { FiMail, FiAlertCircle, FiCheckCircle, FiArrowLeft, FiLoader, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Head from 'next/head';
// Layout removido para evitar import inexistente

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { redirect } = router.query;

  // Validação básica de e-mail em tempo real
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendResetEmail = async () => {
    setError(null);

    if (!isEmailValid) {
      setError('Digite um e-mail válido.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;
      
      setSuccess(`Enviamos um link de redefinição para ${email}. Verifique sua caixa de entrada e a pasta de spam. O link é válido por 24 horas.`);
      setEmailSent(true);
      setCountdown(30); // 30 segundos para reenvio
    } catch (err: any) {
      console.error('Erro ao enviar e-mail de redefinição:', err);
      setError(
        err.message.includes('not found') 
          ? 'E-mail não cadastrado.' 
          : 'Erro ao enviar e-mail de redefinição. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendResetEmail();
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    await sendResetEmail();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <Head>
          <title>Redefinir Senha | Seu App</title>
        </Head>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Redefinir Senha</h1>
          <p className="text-green-100 mt-2">
            {emailSent 
              ? "Verifique seu e-mail" 
              : "Digite seu e-mail para receber o link de redefinição"
            }
          </p>
        </div>
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Redefinir Senha</h1>
            <p className="text-green-100 mt-2">
              {emailSent 
                ? "Verifique seu e-mail" 
                : "Digite seu e-mail para receber o link de redefinição"
              }
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              >
                <FiAlertCircle className="flex-shrink-0 mt-0.5 h-5 w-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 p-4 mb-6 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
              >
                <FiCheckCircle className="flex-shrink-0 mt-0.5 h-5 w-5" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        email.length > 0 && !isEmailValid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="seu@email.com"
                    />
                  </div>
                  {email.length > 0 && !isEmailValid && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      Por favor, insira um email válido
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={!isEmailValid || isLoading}
                    className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isEmailValid && !isLoading 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150`}
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar link de redefinição
                        <FiArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                    <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Verifique seu e-mail</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Enviamos um link de redefinição para <span className="font-medium text-gray-900 dark:text-white">{email}</span>.
                    O link expirará em 24 horas.
                  </p>
                </div>

                <div className="text-sm text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Não recebeu o e-mail? Verifique sua pasta de spam ou{' '}
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={countdown > 0 || isLoading}
                      className={`font-medium ${
                        countdown > 0 || isLoading
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300'
                      }`}
                    >
                      {countdown > 0 ? `Reenviar (${countdown}s)` : 'reenviar o link'}
                    </button>
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/auth/login' + (redirect ? `?redirect=${encodeURIComponent(redirect as string)}` : ''))}
                className="w-full flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
  );
}