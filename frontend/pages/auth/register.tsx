import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiMail, FiLock, FiCheck, FiAlertCircle, FiLoader, FiArrowRight, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fazenda, setFazenda] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const router = useRouter();
  const { register } = useAuth();
  
  // Validação do formulário
  useEffect(() => {
    const isEmailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPasswordValid = password.length >= 8;
    const doPasswordsMatch = password === confirmPassword;
    const isFormValid = 
      name.trim() !== '' && 
      isEmailValid && 
      fazenda.trim() !== '' &&
      isPasswordValid && 
      doPasswordsMatch;

    setEmailValid(isEmailValid);
    setPasswordMatch(doPasswordsMatch);
    setFormValid(isFormValid);
  }, [name, email, password, confirmPassword, fazenda]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); 
    setSuccess(false); 
    try {
      const currentEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!currentEmailValid) {
        setError('Digite um e-mail válido');
        setEmailValid(false);
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('As senhas não coincidem');
        setPasswordMatch(false);
        setLoading(false);
        return;
      }

      if (password.length < 8) { 
        setError('A senha deve ter no mínimo 8 caracteres');
        setLoading(false);
        return;
      }

      // Registrar usuário usando Supabase Auth
      await register(email, password, name, fazenda);
      
      setSuccess(true);
      
      // Redirecionar para login com sucesso
      setTimeout(() => {
        router.push('/auth/login?registration=success');
      }, 2000);
    } catch (err: unknown) {
      console.error('Erro no cadastro:', err);
      
      // Tratamento de erros do Supabase
      const supabaseError = err as { message?: string };
      
      if (supabaseError.message?.includes('User already registered')) {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (supabaseError.message?.includes('Password should be at least 6 characters')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (supabaseError.message?.includes('Invalid email')) {
        setError('Formato de email inválido.');
      } else {
        setError('Erro ao criar conta. Tente novamente ou entre em contato com o suporte.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Removido o useEffect que redirecionava com base no 'success'

  const PasswordStrength = ({ password }: { password: string }) => {
    const strength = {
      0: 'Muito fraca',
      1: 'Fraca',
      2: 'Moderada',
      3: 'Forte',
      4: 'Muito forte'
    };

    const getStrength = () => {
      let score = 0;
      if (!password) return { width: '0%', text: strength[0], color: 'bg-red-500' };

      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-blue-500',
        'bg-green-500'
      ];

      return {
        width: `${(score / 4) * 100}%`,
        text: strength[score as keyof typeof strength],
        color: colors[score]
      };
    };

    const { width, text, color } = getStrength();

    return (
      <div className="mt-1">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${color} transition-all duration-300`}
            style={{ width }}
          />
        </div>
        {passwordFocus && password.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Força da senha: <span className="font-medium">{text}</span>
          </p>
        )}
      </div>
    );
  };

  const PasswordCriteria = ({ password }: { password: string }) => {
    const criteria = [
      { regex: /.{8,}/, text: 'Mínimo 8 caracteres' },
      { regex: /[A-Z]/, text: 'Pelo menos 1 letra maiúscula' },
      { regex: /[0-9]/, text: 'Pelo menos 1 número' },
      { regex: /[^A-Za-z0-9]/, text: 'Pelo menos 1 caractere especial' }
    ];

    return (
      <div className={`mt-2 space-y-1 transition-all duration-300 ${passwordFocus && password.length > 0 ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {criteria.map((item, index) => (
          <div key={index} className="flex items-center">
            {item.regex.test(password) ? (
              <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
            ) : (
              <div className="w-3 h-3 rounded-full border border-gray-400 dark:border-gray-500 mr-2 flex-shrink-0" />
            )}
            <span className={`text-xs ${item.regex.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto text-center border border-gray-200 dark:border-gray-700"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <FiCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">🐄 Bem-vindo ao BOVINEXT!</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Sua conta foi criada com sucesso. Confirme seu email e faça login para começar.</p>
          
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5 }} 
              className="h-full bg-gradient-to-r from-green-600 to-blue-600"
            />
          </div>
          
          <div className="mt-6">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Redirecionando para login ou 
              <Link
                href="/auth/login"
                className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300"
              >
                 clique aqui
              </Link>.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-center">
            <h1 className="text-3xl font-bold text-white">Criar Conta BOVINEXT</h1>
            <p className="text-green-100 mt-2">
              Junte-se à revolução da pecuária inteligente
            </p>
          </div>
          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
              >
                <FiAlertCircle className="flex-shrink-0 mt-0.5 h-5 w-5" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fazenda" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome da Fazenda
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiHome className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fazenda"
                      name="fazenda"
                      type="text"
                      required
                      value={fazenda}
                      onChange={(e) => setFazenda(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Nome da sua fazenda"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        emailValid ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="seu@email.com"
                    />
                    {!emailValid && email.length > 0 && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        Por favor, insira um email válido
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Senha
                    </label>
                  </div>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocus(true)}
                      onBlur={() => setPasswordFocus(false)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                  {passwordFocus && password.length > 0 && (
                    <PasswordStrength password={password} />
                  )}
                  {password.length > 0 && password.length < 8 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      A senha deve ter no mínimo 8 caracteres
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar Senha
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        passwordMatch ? 'border-gray-300 dark:border-gray-600' : 'border-red-500'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="••••••••"
                    />
                    {!passwordMatch && confirmPassword.length > 0 && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        As senhas não coincidem
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!formValid || loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    formValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50`}
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar conta
                      <FiArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
                
                <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                  Já tem uma conta?{' '}
                  <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
                    Fazer login
                  </Link>
                </p>
              </div>
            </form>
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Já tem uma conta?
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/auth/login"
              className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-300 shadow-sm transition-colors duration-150 ease-in-out"
            >
              <FiArrowLeft className="h-5 w-5" />
              Voltar para login
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </motion.div>
    </div>
  );
}