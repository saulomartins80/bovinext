// components/PasswordChangeForm.tsx
import { useState, useCallback, useMemo } from 'react';
import { 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheck, 
  FiX, 
  FiAlertTriangle,
  FiShield,
  FiKey,
  FiZap
} from 'react-icons/fi';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase/client';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import Input from './ui/Input';
import Button from './ui/Button';

interface PasswordChangeFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface PasswordRequirement {
  id: string;
  test: (password: string) => boolean;
  text: string;
  level: 'basic' | 'intermediate' | 'advanced';
}

interface PasswordStrengthResult {
  score: number;
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  color: string;
  text: string;
  suggestions: string[];
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    test: (pwd) => pwd.length >= 8,
    text: 'Pelo menos 8 caracteres',
    level: 'basic'
  },
  {
    id: 'uppercase',
    test: (pwd) => /[A-Z]/.test(pwd),
    text: 'Uma letra maiúscula',
    level: 'basic'
  },
  {
    id: 'lowercase',
    test: (pwd) => /[a-z]/.test(pwd),
    text: 'Uma letra minúscula',
    level: 'basic'
  },
  {
    id: 'number',
    test: (pwd) => /[0-9]/.test(pwd),
    text: 'Um número',
    level: 'basic'
  },
  {
    id: 'special',
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
    text: 'Um caractere especial',
    level: 'intermediate'
  },
  {
    id: 'length12',
    test: (pwd) => pwd.length >= 12,
    text: 'Pelo menos 12 caracteres (recomendado)',
    level: 'intermediate'
  },
  {
    id: 'noSequence',
    test: (pwd) => !/123|abc|qwe|asd/i.test(pwd),
    text: 'Sem sequências comuns',
    level: 'advanced'
  },
  {
    id: 'noRepeat',
    test: (pwd) => !/(.)\1{2,}/.test(pwd),
    text: 'Sem caracteres repetidos consecutivos',
    level: 'advanced'
  }
];

export default function PasswordChangeForm({ onSuccess, onCancel }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [showPasswordTips, setShowPasswordTips] = useState(false);

  // Análise avançada de força da senha
  const passwordStrength = useMemo((): PasswordStrengthResult => {
    if (!newPassword) {
      return {
        score: 0,
        level: 'very-weak',
        color: 'gray',
        text: 'Digite uma senha',
        suggestions: []
      };
    }

    const basicPassed = PASSWORD_REQUIREMENTS.filter(req => req.level === 'basic' && req.test(newPassword)).length;
    const intermediatePassed = PASSWORD_REQUIREMENTS.filter(req => req.level === 'intermediate' && req.test(newPassword)).length;
    const advancedPassed = PASSWORD_REQUIREMENTS.filter(req => req.level === 'advanced' && req.test(newPassword)).length;
    
    const totalScore = basicPassed + intermediatePassed + advancedPassed;
    const suggestions: string[] = [];

    // Gerar sugestões baseadas nos requisitos não atendidos
    if (basicPassed < 4) {
      const failed = PASSWORD_REQUIREMENTS.filter(req => req.level === 'basic' && !req.test(newPassword));
      suggestions.push(`Adicione: ${failed.map(f => f.text.toLowerCase()).join(', ')}`);
    }
    
    if (newPassword.length < 12) {
      suggestions.push('Use pelo menos 12 caracteres para maior segurança');
    }

    if (intermediatePassed === 0) {
      suggestions.push('Considere adicionar caracteres especiais (!@#$%^&*)');
    }

    if (advancedPassed === 0) {
      suggestions.push('Evite sequências e repetições para maior segurança');
    }

    // Determinar nível baseado na pontuação
    if (totalScore <= 2) {
      return {
        score: totalScore,
        level: 'very-weak',
        color: 'red',
        text: 'Muito fraca',
        suggestions
      };
    } else if (totalScore <= 3) {
      return {
        score: totalScore,
        level: 'weak',
        color: 'orange',
        text: 'Fraca',
        suggestions
      };
    } else if (totalScore <= 4) {
      return {
        score: totalScore,
        level: 'fair',
        color: 'yellow',
        text: 'Razoável',
        suggestions
      };
    } else if (totalScore <= 6) {
      return {
        score: totalScore,
        level: 'good',
        color: 'blue',
        text: 'Boa',
        suggestions
      };
    } else if (totalScore <= 7) {
      return {
        score: totalScore,
        level: 'strong',
        color: 'green',
        text: 'Forte',
        suggestions
      };
    } else {
      return {
        score: totalScore,
        level: 'very-strong',
        color: 'emerald',
        text: 'Muito forte',
        suggestions: ['Excelente! Sua senha está muito segura.']
      };
    }
  }, [newPassword]);

  const validatePassword = useCallback((password: string): string => {
    const basicRequirements = PASSWORD_REQUIREMENTS.filter(req => req.level === 'basic');
    const failedBasic = basicRequirements.filter(req => !req.test(password));
    
    if (failedBasic.length > 0) {
      return `Senha deve ter: ${failedBasic.map(req => req.text.toLowerCase()).join(', ')}`;
    }
    return '';
  }, []);

  const passwordsMatch = useMemo(() => 
    newPassword && confirmPassword && newPassword === confirmPassword
  , [newPassword, confirmPassword]);

  const canSubmit = useMemo(() => 
    currentPassword && 
    newPassword && 
    confirmPassword && 
    passwordsMatch && 
    validatePassword(newPassword) === '' &&
    !isLoading
  , [currentPassword, newPassword, confirmPassword, passwordsMatch, validatePassword, isLoading]);

  const handleCurrentPasswordVerification = useCallback(async () => {
    if (!currentPassword) return;
    
    setIsReauthenticating(true);
    setError('');
    
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Usuário não autenticado');

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      setCurrentPasswordVerified(true);
      toast.success('Senha atual verificada com sucesso!');
    } catch (err: any) {
      console.error('Error verifying current password:', err);
      setError('Senha atual incorreta. Verifique e tente novamente.');
      setCurrentPasswordVerified(false);
    } finally {
      setIsReauthenticating(false);
    }
  }, [currentPassword]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canSubmit) return;

    // Verificar senha atual se ainda não foi verificada
    if (!currentPasswordVerified) {
      await handleCurrentPasswordVerification();
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword === currentPassword) {
      setError('A nova senha deve ser diferente da senha atual');
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      await updatePassword(user, newPassword);
      toast.success('Senha alterada com sucesso!');
      onSuccess();
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, currentPasswordVerified, handleCurrentPasswordVerification, newPassword, confirmPassword, validatePassword, currentPassword, onSuccess]);

  const generateSecurePassword = useCallback(() => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Garantir pelo menos um de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar até 16 caracteres
    for (let i = 4; i < 16; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Embaralhar
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setNewPassword(password);
    setConfirmPassword(password);
    toast.success('Senha segura gerada! Lembre-se de guardá-la em local seguro.');
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 mb-4">
          <FiLock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alterar Senha</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Crie uma nova senha segura para proteger sua conta
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex">
                <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erro na alteração da senha
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Password */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              label="Senha Atual"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setCurrentPasswordVerified(false);
              }}
              placeholder="Digite sua senha atual"
              required
              icon={<FiKey className="w-5 h-5" />}
              disabled={isLoading || isReauthenticating}
              className={currentPasswordVerified ? 'border-green-300 dark:border-green-700' : ''}
            />
            
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
              {currentPasswordVerified && (
                <FiCheck className="w-5 h-5 text-green-500" />
              )}
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {currentPassword && !currentPasswordVerified && (
            <button
              type="button"
              onClick={handleCurrentPasswordVerification}
              disabled={isReauthenticating}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              {isReauthenticating ? 'Verificando...' : 'Verificar senha atual'}
            </button>
          )}
        </div>

        {/* New Password Section - Only show after current password is verified */}
        <AnimatePresence>
          {currentPasswordVerified && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Password Generator */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiZap className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Gerar senha segura
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    Gerar
                  </button>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Gera automaticamente uma senha forte e segura
                </p>
              </div>

              {/* New Password Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    label="Nova Senha"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    required
                    icon={<FiLock className="w-5 h-5" />}
                    disabled={isLoading}
                  />
                  
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordTips(!showPasswordTips)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      title="Dicas de senha"
                    >
                      <FiShield className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Força da senha:</span>
                        <span className={`font-medium text-${passwordStrength.color}-600 dark:text-${passwordStrength.color}-400`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className={`h-2 bg-${passwordStrength.color}-500 rounded-full transition-all duration-500`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="grid grid-cols-1 gap-2">
                      {PASSWORD_REQUIREMENTS.filter(req => req.level === 'basic').map((requirement) => {
                        const passed = requirement.test(newPassword);
                        return (
                          <motion.div 
                            key={requirement.id} 
                            className="flex items-center text-xs"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            {passed ? (
                              <FiCheck className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                              <FiX className="h-3 w-3 text-gray-400 mr-2 flex-shrink-0" />
                            )}
                            <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                              {requirement.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Advanced Tips */}
                    <AnimatePresence>
                      {showPasswordTips && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                        >
                          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Dicas para uma senha mais segura:
                          </h4>
                          <div className="space-y-1">
                            {PASSWORD_REQUIREMENTS.filter(req => req.level !== 'basic').map((requirement) => {
                              const passed = requirement.test(newPassword);
                              return (
                                <div key={requirement.id} className="flex items-center text-xs">
                                  {passed ? (
                                    <FiCheck className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                  ) : (
                                    <div className="h-3 w-3 rounded-full border border-gray-300 dark:border-gray-600 mr-2 flex-shrink-0" />
                                  )}
                                  <span className={passed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                                    {requirement.text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Suggestions */}
                    {passwordStrength.suggestions.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Sugestões:</strong>
                        <ul className="mt-1 space-y-1">
                          {passwordStrength.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  label="Confirmar Nova Senha"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  required
                  icon={<FiLock className="w-5 h-5" />}
                  disabled={isLoading}
                  success={passwordsMatch ? 'Senhas coincidem' : undefined}
                  error={confirmPassword && !passwordsMatch ? 'As senhas não coincidem' : undefined}
                />
                
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                  {passwordsMatch && (
                    <FiCheck className="w-5 h-5 text-green-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading || isReauthenticating}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!canSubmit || isReauthenticating}
            fullWidth
          >
            {isLoading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </div>
      </form>

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
      >
        <div className="flex items-start">
          <FiShield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Dicas de Segurança
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use uma senha única que você não usa em outros sites</li>
              <li>• Considere usar um gerenciador de senhas</li>
              <li>• Nunca compartilhe sua senha com outras pessoas</li>
              <li>• Altere sua senha regularmente ou se suspeitar de comprometimento</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}