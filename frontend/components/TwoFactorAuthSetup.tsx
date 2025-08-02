// components/TwoFactorAuthSetup.tsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  FiCheck, 
  FiCopy, 
  FiKey, 
  FiSmartphone, 
  FiDownload, 
  FiShield, 
  FiAlertTriangle, 
  FiInfo,
  FiArrowRight,
  FiArrowLeft,
  FiLock,
  FiEye,
  FiEyeOff,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Input from './ui/Input';
// import Button from './ui/Button';

interface TwoFactorAuthSetupProps {
  onComplete?: (success: boolean) => void;
  currentStatus: boolean;
}

type SetupStep = 'intro' | 'download' | 'scan' | 'verify' | 'backup' | 'complete' | 'manage';

interface AuthApp {
  name: string;
  icon: string;
  platforms: string[];
  description: string;
  downloadUrl: {
    ios?: string;
    android?: string;
    web?: string;
  };
}

const AUTHENTICATOR_APPS: AuthApp[] = [
  {
    name: 'Google Authenticator',
    icon: '🔐',
    platforms: ['iOS', 'Android'],
    description: 'App oficial do Google, simples e confiável',
    downloadUrl: {
      ios: 'https://apps.apple.com/app/google-authenticator/id388497605',
      android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'
    }
  },
  {
    name: 'Authy',
    icon: '🛡️',
    platforms: ['iOS', 'Android', 'Desktop'],
    description: 'Sincronização em nuvem e backup automático',
    downloadUrl: {
      ios: 'https://apps.apple.com/app/authy/id494168017',
      android: 'https://play.google.com/store/apps/details?id=com.authy.authy',
      web: 'https://authy.com/download/'
    }
  },
  {
    name: 'Microsoft Authenticator',
    icon: '🔵',
    platforms: ['iOS', 'Android'],
    description: 'Integração com contas Microsoft e backup na nuvem',
    downloadUrl: {
      ios: 'https://apps.apple.com/app/microsoft-authenticator/id983156458',
      android: 'https://play.google.com/store/apps/details?id=com.azure.authenticator'
    }
  },
  {
    name: '1Password',
    icon: '🔑',
    platforms: ['iOS', 'Android', 'Desktop'],
    description: 'Gerenciador de senhas com autenticador integrado',
    downloadUrl: {
      ios: 'https://apps.apple.com/app/1password-password-manager/id568903335',
      android: 'https://play.google.com/store/apps/details?id=com.onepassword.android',
      web: 'https://1password.com/downloads/'
    }
  }
];

export default function TwoFactorAuthSetup({ onComplete, currentStatus }: TwoFactorAuthSetupProps) {
  const [step, setStep] = useState<SetupStep>(currentStatus ? 'manage' : 'intro');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const [qrCodeUri, setQrCodeUri] = useState(''); // Commented out as it's used but not displayed
  const [userEmail] = useState('usuario@finnextho.com');
  const [selectedApp, setSelectedApp] = useState<AuthApp | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [remainingTime, setRemainingTime] = useState(30);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Safe toast function
  const safeToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    if (!isMountedRef.current) return;
    
    try {
      // Check if toast is available
      if (typeof toast === 'undefined' || !toast) {
        console.warn('Toast not available');
        return;
      }

      // Use a small delay to ensure the component is fully mounted
      setTimeout(() => {
        if (!isMountedRef.current) return;
        
        try {
          switch (type) {
            case 'success':
              toast.success(message, {
                containerId: 'main-toast-container',
                onClose: () => {
                  // Cleanup function to prevent memory leaks
                }
              });
              break;
            case 'error':
              toast.error(message, {
                containerId: 'main-toast-container',
                onClose: () => {
                  // Cleanup function to prevent memory leaks
                }
              });
              break;
            case 'warning':
              toast.warning(message, {
                containerId: 'main-toast-container',
                onClose: () => {
                  // Cleanup function to prevent memory leaks
                }
              });
              break;
            case 'info':
              toast.info(message, {
                containerId: 'main-toast-container',
                onClose: () => {
                  // Cleanup function to prevent memory leaks
                }
              });
              break;
          }
        } catch (toastError) {
          console.error('Toast error:', toastError);
          // Fallback to console.log if toast fails
          console.log(`[${type.toUpperCase()}] ${message}`);
        }
      }, 100);
    } catch (error) {
      console.error('Toast setup error:', error);
      // Fallback to console.log
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }, []);

  // Timer para mostrar quando o código TOTP vai renovar
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = 30 - (now % 30);
      setRemainingTime(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Gerar dados necessários para o setup
  useEffect(() => {
    if ((step === 'scan' || step === 'verify') && !secret) {
      generateSetupData();
    }
  }, [step, secret]);

  const generateSetupData = useCallback(() => {
    // Gerar segredo TOTP compatível (Base32)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let newSecret = '';
    for (let i = 0; i < 32; i++) {
      newSecret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Gerar códigos de backup seguros
    const newBackupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      newBackupCodes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }

    // Criar URI padrão otpauth para apps autenticadores (não usado no momento)
    // const issuer = 'FinNEXTHO';
    // const accountName = userEmail;
    // const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${newSecret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

    setSecret(newSecret);
    setBackupCodes(newBackupCodes);
    // setQrCodeUri(uri); // Commented out as QR code generation is placeholder
  }, []);

  const formattedSecret = useMemo(() => {
    if (!secret) return '';
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  }, [secret]);

  const handleCopySecret = useCallback(() => {
    try {
      navigator.clipboard.writeText(secret);
      safeToast('success', 'Código secreto copiado para a área de transferência!');
    } catch (error) {
      console.error('Error copying secret:', error);
      safeToast('error', 'Erro ao copiar código secreto');
    }
  }, [secret, safeToast]);

  const handleCopyBackupCodes = useCallback(() => {
    try {
      const codesText = `FinNEXTHO - Códigos de Backup 2FA\nGerados em: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nGuarde estes códigos em local seguro. Cada código pode ser usado apenas uma vez.`;
      navigator.clipboard.writeText(codesText);
      safeToast('success', 'Códigos de backup copiados para a área de transferência!');
    } catch (error) {
      console.error('Error copying backup codes:', error);
      safeToast('error', 'Erro ao copiar códigos de backup');
    }
  }, [backupCodes, safeToast]);

  const handleDownloadBackupCodes = useCallback(() => {
    try {
      const codesText = `FinNEXTHO - Códigos de Backup 2FA\nGerados em: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nGuarde estes códigos em local seguro. Cada código pode ser usado apenas uma vez.`;
      
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finnextho-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setBackupCodesDownloaded(true);
      safeToast('success', 'Códigos de backup baixados com sucesso!');
    } catch (error) {
      console.error('Error downloading backup codes:', error);
      safeToast('error', 'Erro ao baixar códigos de backup');
    }
  }, [backupCodes, safeToast]);

  const handleVerifyCode = useCallback(() => {
    setIsLoading(true);
    setError('');

    // Simular verificação do código TOTP
    setTimeout(() => {
      if (!isMountedRef.current) return;
      
      setIsLoading(false);
      setVerificationAttempts(prev => prev + 1);
      
      // Simular código válido (qualquer código de 6 dígitos)
      if (/^\d{6}$/.test(verificationCode)) {
        setStep('backup');
        safeToast('success', 'Código verificado com sucesso!');
      } else {
        setError(`Código inválido. Tentativa ${verificationAttempts + 1}/3. Verifique se o código está correto e tente novamente.`);
        
        if (verificationAttempts >= 2) {
          setError('Muitas tentativas falharam. Por favor, verifique se o aplicativo foi configurado corretamente e tente novamente.');
          setStep('scan');
          setVerificationAttempts(0);
        }
      }
      setVerificationCode('');
    }, 1500);
  }, [verificationCode, verificationAttempts, safeToast]);

  const handleComplete2FASetup = useCallback(() => {
    setStep('complete');
    onComplete(true);
    safeToast('success', 'Autenticação de dois fatores configurada com sucesso!');
  }, [onComplete, safeToast]);

  const handleDisable2FA = useCallback(() => {
    if (!confirm('Tem certeza que deseja desativar a autenticação de dois fatores? Isso tornará sua conta menos segura.')) {
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      if (!isMountedRef.current) return;
      
      setIsLoading(false);
      setStep('intro');
      onComplete(false);
      safeToast('success', 'Autenticação de dois fatores desativada.');
    }, 1000);
  }, [onComplete, safeToast]);

  const handleRegenerateBackupCodes = useCallback(() => {
    if (!confirm('Isso invalidará seus códigos de backup atuais. Tem certeza que deseja continuar?')) {
      return;
    }

    // Gerar novos códigos
    const newBackupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      newBackupCodes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }

    setBackupCodes(newBackupCodes);
    setStep('backup');
    safeToast('success', 'Novos códigos de backup gerados!');
  }, [safeToast]);

  const renderProgressIndicator = () => {
    const steps = ['intro', 'download', 'scan', 'verify', 'backup', 'complete'];
    const currentIndex = steps.indexOf(step);
    
    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((stepName, index) => (
          <div key={stepName} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              index < currentIndex 
                ? 'bg-green-500 text-white' 
                : index === currentIndex 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {index < currentIndex ? <FiCheck className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-1 mx-2 transition-all duration-300 ${
                index < currentIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Step: Manage (quando 2FA já está ativo)
  if (step === 'manage') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <FiShield className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            2FA Ativo
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Sua conta está protegida com autenticação de dois fatores
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
          <div className="flex">
            <FiCheck className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Autenticação de dois fatores ativa
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Sua conta possui uma camada extra de segurança. Você precisará do seu aplicativo autenticador para fazer login.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <button
            onClick={handleRegenerateBackupCodes}
            className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <FiRefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Gerar novos códigos de backup
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Crie novos códigos de recuperação
                </div>
              </div>
            </div>
            <FiArrowRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => setStep('backup')}
            className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <FiDownload className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Ver códigos de backup
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Visualizar e baixar códigos de recuperação
                </div>
              </div>
            </div>
            <FiArrowRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleDisable2FA}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Desativando...' : 'Desativar Autenticação de Dois Fatores'}
          </button>
        </div>
      </div>
    );
  }

  // Step: Complete
  if (step === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20">
          <FiCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎉 Parabéns!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Autenticação de dois fatores configurada com sucesso
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
            Sua conta agora está mais segura! 🛡️
          </h3>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
            <li>✓ Autenticação de dois fatores ativada</li>
            <li>✓ Códigos de backup salvos</li>
            <li>✓ Aplicativo autenticador configurado</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Próximos passos importantes:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• Guarde seus códigos de backup em local seguro</li>
                <li>• Teste o login com 2FA em uma sessão privada</li>
                <li>• Considere ativar 2FA em outras contas importantes</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => onComplete(true)}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Concluir Configuração
        </button>
      </motion.div>
    );
  }

  // Step: Backup Codes
  if (step === 'backup') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 mb-4">
            <FiKey className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Códigos de Backup
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Guarde estes códigos em local seguro
          </p>
        </div>

        {renderProgressIndicator()}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Importante: Códigos de Recuperação
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Estes códigos permitem acessar sua conta se você perder seu dispositivo. 
                Cada código pode ser usado apenas uma vez.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Seus códigos de backup:
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleCopyBackupCodes}
                className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Copiar códigos"
              >
                <FiCopy className="inline mr-1 w-3 h-3" /> Copiar
              </button>
              <button
                onClick={handleDownloadBackupCodes}
                className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                title="Baixar códigos"
              >
                <FiDownload className="inline mr-1 w-3 h-3" /> Baixar
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {backupCodes.map((code, i) => (
              <div 
                key={i} 
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-center border"
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiLock className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Dicas de segurança:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                <li>• Armazene em local seguro (cofre, gerenciador de senhas)</li>
                <li>• Não compartilhe com outras pessoas</li>
                <li>• Cada código funciona apenas uma vez</li>
                <li>• Gere novos códigos se necessário</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('verify')}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft className="inline mr-2 w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={handleComplete2FASetup}
            disabled={!backupCodesDownloaded}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {backupCodesDownloaded ? 'Finalizar Configuração' : 'Baixe os códigos primeiro'}
            <FiArrowRight className="inline ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step: Verify
  if (step === 'verify') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
            <FiSmartphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Verificar Configuração
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Digite o código do seu aplicativo autenticador
          </p>
        </div>

        {renderProgressIndicator()}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Código atual no seu app:
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                O código muda a cada 30 segundos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full border-2 ${remainingTime <= 5 ? 'border-red-500' : 'border-blue-500'} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${remainingTime <= 5 ? 'text-red-500' : 'text-blue-500'}`}>
                  {remainingTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              label="Código de 6 dígitos"
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              placeholder="000000"
              maxLength={6}
              className="text-center text-xl font-mono tracking-widest"
              autoComplete="off"
              icon={<FiKey className="w-5 h-5" />}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Digite o código de 6 dígitos mostrado no seu aplicativo autenticador
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex">
                <FiAlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erro na verificação
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('scan')}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft className="inline mr-2 w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={handleVerifyCode}
            disabled={isLoading || verificationCode.length !== 6}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />
                Verificando...
              </>
            ) : (
              <>
                Verificar Código
                <FiArrowRight className="inline ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Step: Scan QR Code
  if (step === 'scan') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
            <FiKey className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Configurar Aplicativo
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Escaneie o QR code ou digite o código manualmente
          </p>
        </div>

        {renderProgressIndicator()}

        <div className="text-center">
          <div className="inline-block p-4 bg-white rounded-lg shadow-lg mb-4">
            {/* Aqui seria renderizado o QR Code real. Para este exemplo, uso um placeholder */}
            <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <FiKey className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">QR Code</p>
                <p className="text-xs text-gray-400">Escaneie com seu app</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Abra seu aplicativo autenticador e escaneie este código QR
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Ou digite manualmente:
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {showSecret ? <FiEyeOff className="inline w-3 h-3" /> : <FiEye className="inline w-3 h-3" />}
              </button>
              <button
                onClick={handleCopySecret}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <FiCopy className="inline mr-1 w-3 h-3" /> Copiar
              </button>
            </div>
          </div>
          
          <div className="font-mono text-sm bg-white dark:bg-gray-900 p-3 rounded border">
            {showSecret ? formattedSecret : '••••• ••••• ••••• •••••'}
          </div>
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p><strong>Nome da conta:</strong> {userEmail}</p>
            <p><strong>Emissor:</strong> FinNEXTHO</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Como configurar:
              </h4>
              <ol className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-decimal list-inside">
                <li>Abra seu aplicativo autenticador</li>
                <li>Toque em "Adicionar conta" ou "+"</li>
                <li>Escaneie este QR code ou digite o código manual</li>
                <li>Sua conta FinNEXTHO aparecerá no app</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('download')}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft className="inline mr-2 w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={() => setStep('verify')}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Próximo: Verificar
            <FiArrowRight className="inline ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step: Download App
  if (step === 'download') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
            <FiDownload className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Baixar Aplicativo
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Escolha um aplicativo autenticador para configurar
          </p>
        </div>

        {renderProgressIndicator()}

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiInfo className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Aplicativos Recomendados
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Escolha um dos aplicativos abaixo para gerar códigos de autenticação. 
                Todos são gratuitos e seguros.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {AUTHENTICATOR_APPS.map((app) => (
            <button
              key={app.name}
              onClick={() => setSelectedApp(app)}
              className={`p-4 border rounded-lg text-left transition-all duration-200 hover:scale-[1.02] ${
                selectedApp?.name === app.name
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{app.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {app.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {app.description}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {app.platforms.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {app.downloadUrl.ios && (
                    <a
                      href={app.downloadUrl.ios}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      iOS
                    </a>
                  )}
                  {app.downloadUrl.android && (
                    <a
                      href={app.downloadUrl.android}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                    >
                      Android
                    </a>
                  )}
                  {app.downloadUrl.web && (
                    <a
                      href={app.downloadUrl.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Web
                    </a>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Dica importante
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Se você já tem um aplicativo autenticador instalado, pode pular esta etapa 
                e ir direto para a configuração.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('intro')}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft className="inline mr-2 w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={() => setStep('scan')}
            disabled={!selectedApp}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Próximo: Configurar
            <FiArrowRight className="inline ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step: Intro (default step)
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
          <FiShield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Autenticação de Dois Fatores
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Adicione uma camada extra de segurança à sua conta
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              O que é autenticação de dois fatores?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Além da sua senha, você precisará de um código gerado por um aplicativo 
              autenticador para fazer login. Isso torna sua conta muito mais segura.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                Benefícios da 2FA:
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                <li>• Proteção contra hackers mesmo se sua senha for comprometida</li>
                <li>• Códigos que mudam a cada 30 segundos</li>
                <li>• Códigos de backup para emergências</li>
                <li>• Compatível com todos os aplicativos autenticadores</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Importante saber:
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                <li>• Você precisará de um aplicativo autenticador (Google Authenticator, Authy, etc.)</li>
                <li>• Guarde os códigos de backup em local seguro</li>
                <li>• Sem o app ou códigos de backup, você pode perder acesso à conta</li>
                <li>• Pode ser desativado a qualquer momento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => onComplete(false)}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => setStep('download')}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Começar Configuração
          <FiArrowRight className="inline ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
}