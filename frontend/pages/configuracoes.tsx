// pages/configuracoes.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FiGlobe,
  FiBell,
  FiDatabase,
  FiUser,
  FiMail,
  FiLock,
  FiCreditCard,
  FiMoon,
  FiSun,
  FiMonitor,
  FiShield,
  FiTrash2,
  FiKey,
  FiHardDrive,
  FiPlusCircle,
  FiSave,
  FiCheck,
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useTheme, Theme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import DangerZone from '../components/DangerZone';
import Modal from "../components/Modal";
import PasswordChangeForm from "../components/PasswordChangeForm";
import TwoFactorAuthSetup from "../components/TwoFactorAuthSetup";
import { useRouter } from 'next/router';
import Notifications, { NotificationItem } from '../components/Notifications';
// import Input from '../components/ui/Input'; // Currently unused
import Select from '../components/ui/Select';

// Tipos e interfaces
interface Settings {
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  dataSharing: boolean;
  currency: string;
  twoFactorEnabled: boolean;
  backupFrequency: string;
  sessionTimeout: number;
}

type BackupStatus = 'idle' | 'in-progress' | 'completed' | 'failed';
type TabId = 'account' | 'notifications' | 'privacy' | 'security' | 'danger';

interface SettingOption {
  value: string | number | Theme;
  label: string;
  icon?: React.ReactNode;
}

interface AccountSetting {
  name: keyof Settings | 'themeSelector' | 'changePassword' | 'backup';
  label: string;
  description: string;
  type: "toggle" | "select" | "radiogroup" | "action";
  options?: SettingOption[];
  currentValue?: any;
  onChange?: (_value: any) => void;
  icon: React.ReactNode;
  action?: () => void;
  status?: string;
  isLoading?: boolean;
  category?: string;
}

// Constantes
const DEFAULT_SETTINGS: Settings = {
  language: 'pt-BR',
  emailNotifications: true,
  pushNotifications: true,
  dataSharing: false,
  currency: 'BRL',
  twoFactorEnabled: false,
  backupFrequency: 'weekly',
  sessionTimeout: 30
};

const LANGUAGE_OPTIONS = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español' },
  { value: 'fr-FR', label: 'Français' }
];

const CURRENCY_OPTIONS = [
  { value: 'BRL', label: 'Real (R$)' },
  { value: 'USD', label: 'Dólar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'Libra (£)' }
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Claro', icon: <FiSun className="w-4 h-4" /> },
  { value: 'dark', label: 'Escuro', icon: <FiMoon className="w-4 h-4" /> },
  { value: 'system', label: 'Automático', icon: <FiMonitor className="w-4 h-4" /> }
];

const SESSION_TIMEOUT_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' }
];

const TABS = [
  { id: 'account', label: 'Conta', icon: <FiUser className="mr-3" />, color: 'blue' },
  { id: 'notifications', label: 'Notificações', icon: <FiBell className="mr-3" />, color: 'green' },
  { id: 'privacy', label: 'Privacidade', icon: <FiDatabase className="mr-3" />, color: 'purple' },
  { id: 'security', label: 'Segurança', icon: <FiShield className="mr-3" />, color: 'orange' },
  { id: 'danger', label: 'Zona de Risco', icon: <FiTrash2 className="mr-3" />, color: 'red' }
] as const;

export default function ConfiguracoesPage() {
  const { user, updateUserContextProfile } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  // Estados
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [backupStatus, setBackupStatus] = useState<BackupStatus>('idle');
  const [_sampleNotifications, setSampleNotifications] = useState<NotificationItem[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Carregamento inicial otimizado
  const loadInitialData = useCallback(async () => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists() && docSnap.data().settings) {
        const userSettings = { ...DEFAULT_SETTINGS, ...docSnap.data().settings };
        setSettings(userSettings);
        setOriginalSettings(userSettings);
      }
    } catch (error) {
      console.error('[ConfiguracoesPage] Error loading initial data:', error);
      toast.error('Erro ao carregar dados da página.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Verificar mudanças não salvas
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, originalSettings]);

  // Handlers otimizados
  const handleSettingChange = useCallback((key: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    // Salva automaticamente a mudança de tema
    setTimeout(() => saveSettings(), 100);
  }, [setTheme]);

  const saveSettings = useCallback(async () => {
    if (!user?.uid) return;
    
    setIsSaving(true);
    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { settings }, { merge: true });
      
      setOriginalSettings(settings);
      setHasUnsavedChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('[ConfiguracoesPage] Error saving settings:', error);
      toast.error('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  }, [user?.uid, settings]);

  const handleBackupData = useCallback(async () => {
    if (!user?.uid) return;
    
    setBackupStatus('in-progress');
    try {
      // Simular backup mais realista
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Aqui você implementaria a lógica real de backup
      const backupData = {
        settings,
        userData: user,
        timestamp: new Date().toISOString()
      };
      
      // Criar e baixar arquivo de backup
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setBackupStatus('completed');
      toast.success('Backup realizado e baixado com sucesso!');
      
      // Reset status after 3 seconds
      setTimeout(() => setBackupStatus('idle'), 3000);
    } catch (_error) {
      setBackupStatus('failed');
      toast.error('Erro ao realizar backup.');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }
  }, [user?.uid, settings, user]);

  const handlePasswordChangeSuccess = useCallback(() => {
    setShowPasswordModal(false);
    toast.success('Senha alterada com sucesso!');
  }, []);

  const handle2FASetupComplete = useCallback((success: boolean) => {
    setShow2FAModal(false);
    if (success) {
      setSettings(prev => ({ ...prev, twoFactorEnabled: true }));
      toast.success('Autenticação de dois fatores configurada com sucesso!');
    }
  }, []);

  const addSampleNotification = useCallback((type: NotificationItem['type'], message: string) => {
    const newNotification: NotificationItem = {
      id: `sample-${notificationCounter}`,
      type,
      message,
      createdAt: new Date().toISOString()
    };
    setSampleNotifications(prev => [...prev, newNotification]);
    setNotificationCounter(prev => prev + 1);
  }, [notificationCounter]);

  const resetToDefaults = useCallback(() => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Configurações organizadas por categoria
  const accountSettings: AccountSetting[] = useMemo(() => [
    {
      name: 'language',
      label: 'Idioma',
      description: 'Escolha o idioma da interface',
      type: 'select',
      options: LANGUAGE_OPTIONS,
      currentValue: settings.language,
      onChange: (value) => handleSettingChange('language', value),
      icon: <FiGlobe className="w-5 h-5" />,
      category: 'Personalização'
    },
    {
      name: 'currency',
      label: 'Moeda',
      description: 'Moeda padrão para transações',
      type: 'select',
      options: CURRENCY_OPTIONS,
      currentValue: settings.currency,
      onChange: (value) => handleSettingChange('currency', value),
      icon: <FiCreditCard className="w-5 h-5" />,
      category: 'Personalização'
    },
    {
      name: 'themeSelector',
      label: 'Tema',
      description: 'Escolha entre tema claro, escuro ou automático',
      type: 'radiogroup',
      options: THEME_OPTIONS,
      currentValue: theme,
      onChange: handleThemeChange,
      icon: <FiMonitor className="w-5 h-5" />,
      category: 'Aparência'
    },
    {
      name: 'changePassword',
      label: 'Alterar Senha',
      description: 'Atualize sua senha de acesso',
      type: 'action',
      action: () => setShowPasswordModal(true),
      icon: <FiLock className="w-5 h-5" />,
      category: 'Segurança'
    },
    {
      name: 'backup',
      label: 'Backup de Dados',
      description: 'Faça backup dos seus dados pessoais',
      type: 'action',
      action: handleBackupData,
      icon: <FiHardDrive className="w-5 h-5" />,
      status: backupStatus === 'in-progress' ? 'Gerando backup...' : 
              backupStatus === 'completed' ? 'Backup concluído' : 
              backupStatus === 'failed' ? 'Falha no backup' : undefined,
      isLoading: backupStatus === 'in-progress',
      category: 'Dados'
    }
  ], [settings, theme, handleSettingChange, handleThemeChange, handleBackupData, backupStatus]);

  const notificationSettings: AccountSetting[] = useMemo(() => [
    {
      name: 'emailNotifications',
      label: 'Notificações por Email',
      description: 'Receba notificações importantes por email',
      type: 'toggle',
      currentValue: settings.emailNotifications,
      onChange: (value) => handleSettingChange('emailNotifications', value),
      icon: <FiMail className="w-5 h-5" />
    },
    {
      name: 'pushNotifications',
      label: 'Notificações Push',
      description: 'Receba notificações em tempo real',
      type: 'toggle',
      currentValue: settings.pushNotifications,
      onChange: (value) => handleSettingChange('pushNotifications', value),
      icon: <FiBell className="w-5 h-5" />
    }
  ], [settings, handleSettingChange]);

  const privacySettings: AccountSetting[] = useMemo(() => [
    {
      name: 'dataSharing',
      label: 'Compartilhamento de Dados',
      description: 'Permitir compartilhamento de dados para melhorias',
      type: 'toggle',
      currentValue: settings.dataSharing,
      onChange: (value) => handleSettingChange('dataSharing', value),
      icon: <FiDatabase className="w-5 h-5" />
    }
  ], [settings, handleSettingChange]);

  const securitySettings: AccountSetting[] = useMemo(() => [
    {
      name: 'twoFactorEnabled',
      label: 'Autenticação de Dois Fatores',
      description: 'Adicione uma camada extra de segurança à sua conta',
      type: 'action',
      action: () => setShow2FAModal(true),
      icon: <FiShield className="w-5 h-5" />,
      status: settings.twoFactorEnabled ? 'Ativado' : 'Desativado'
    },
    {
      name: 'sessionTimeout',
      label: 'Tempo de Sessão',
      description: 'Tempo de inatividade antes do logout automático',
      type: 'select',
      options: SESSION_TIMEOUT_OPTIONS,
      currentValue: settings.sessionTimeout,
      onChange: (value) => handleSettingChange('sessionTimeout', value),
      icon: <FiKey className="w-5 h-5" />
    }
  ], [settings, handleSettingChange]);

  // Componente de controle melhorado
  const renderSettingControl = useCallback((setting: AccountSetting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={setting.currentValue}
                onChange={(e) => setting.onChange?.(e.target.checked)}
                className="sr-only peer"
                aria-label={setting.label}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 hover:peer-checked:bg-blue-700"></div>
            </label>
          </div>
        );

      case 'select':
        return (
          <div className="min-w-[150px]">
            <Select
              value={setting.currentValue}
              onChange={(e) => setting.onChange?.(e.target.value)}
              options={setting.options?.map(opt => ({ 
                value: opt.value.toString(), 
                label: opt.label 
              })) || []}
              size="sm"
              aria-label={setting.label}
            />
          </div>
        );

      case 'radiogroup':
        return (
          <div className="flex gap-2" role="radiogroup" aria-label={setting.label}>
            {setting.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => setting.onChange?.(option.value)}
                className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${
                  setting.currentValue === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                title={option.label}
                role="radio"
                aria-checked={setting.currentValue === option.value}
              >
                {option.icon}
              </button>
            ))}
          </div>
        );

      case 'action':
        return (
          <button
            onClick={setting.action}
            disabled={setting.isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              setting.isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
            }`}
          >
            {setting.isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {setting.status || 'Configurar'}
          </button>
        );

      default:
        return null;
    }
  }, []);

  // Componente de seção de configurações
  const SettingsSection = ({ title, settings, children }: { 
    title: string; 
    settings: AccountSetting[]; 
    children?: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          {children}
        </div>
        
        <div className="space-y-6">
          {settings.map((setting) => (
            <motion.div 
              key={setting.name} 
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start sm:items-center">
                <div className={`p-2 rounded-lg mr-3 ${
                  resolvedTheme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {setting.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {setting.label}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {setting.description}
                  </p>
                  {setting.status && (
                    <p className={`text-xs mt-1 ${
                      setting.status.includes('Ativado') || setting.status.includes('concluído')
                        ? 'text-green-600 dark:text-green-400'
                        : setting.status.includes('Falha') || setting.status.includes('Desativado')
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {setting.status}
                    </p>
                  )}
                </div>
              </div>
              {renderSettingControl(setting)}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className={`px-6 py-4 flex items-center justify-between ${
        resolvedTheme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center text-amber-600 dark:text-amber-400"
            >
              <FiAlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm">Alterações não salvas</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex space-x-3">
          {hasUnsavedChanges && (
            <button
              onClick={resetToDefaults}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-4 h-4 mr-1" />
              Resetar
            </button>
          )}
          
          <button
            onClick={saveSettings}
            disabled={isSaving || !hasUnsavedChanges}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSaving || !hasUnsavedChanges
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 hover:shadow-md active:transform active:scale-95'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : hasUnsavedChanges ? (
              <>
                <FiSave className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4 mr-2" />
                Salvo
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center transition-colors duration-300 ${
        resolvedTheme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      resolvedTheme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Modals */}
      <AnimatePresence>
        {showPasswordModal && (
          <Modal
            isOpen={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            title="Alterar Senha"
          >
            <PasswordChangeForm
              onSuccess={handlePasswordChangeSuccess}
              onCancel={() => setShowPasswordModal(false)}
            />
          </Modal>
        )}

        {show2FAModal && (
          <Modal
            isOpen={show2FAModal}
            onClose={() => setShow2FAModal(false)}
            title={settings.twoFactorEnabled ? "Gerenciar Autenticação de Dois Fatores" : "Configurar Autenticação de Dois Fatores"}
            size="lg"
          >
            <TwoFactorAuthSetup
              onComplete={handle2FASetupComplete}
              currentStatus={settings.twoFactorEnabled}
            />
          </Modal>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            Configurações
          </motion.h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Personalize sua experiência e gerencie sua conta
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 sticky top-6">
              <nav>
                {TABS.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`w-full text-left px-6 py-4 flex items-center transition-all duration-200 ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-50 dark:bg-${tab.color}-900/20 text-${tab.color}-600 dark:text-${tab.color}-400 border-r-2 border-${tab.color}-600 shadow-sm`
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    whileHover={{ x: activeTab !== tab.id ? 4 : 0 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab.icon}
                    {tab.label}
                    {hasUnsavedChanges && activeTab === tab.id && (
                      <div className="ml-auto w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    )}
                  </motion.button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <SettingsSection 
                  key="account"
                  title="Configurações da Conta" 
                  settings={accountSettings} 
                />
              )}

              {activeTab === 'notifications' && (
                <SettingsSection 
                  key="notifications"
                  title="Configurações de Notificações" 
                  settings={notificationSettings}
                >
                  <button
                    onClick={() => addSampleNotification('info', `Notificação de Exemplo ${notificationCounter + 1}`)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      resolvedTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <FiPlusCircle size={16} /> Adicionar Exemplo
                  </button>
                </SettingsSection>
              )}

              {activeTab === 'privacy' && (
                <SettingsSection 
                  key="privacy"
                  title="Configurações de Privacidade" 
                  settings={privacySettings} 
                />
              )}

              {activeTab === 'security' && (
                <SettingsSection 
                  key="security"
                  title="Configurações de Segurança" 
                  settings={securitySettings} 
                />
              )}

              {activeTab === 'danger' && (
                <motion.div
                  key="danger"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-red-200 dark:border-red-800"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-6">
                      <div className="p-2 rounded-lg mr-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        <FiTrash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Zona de Risco</h2>
                        <p className="text-red-500 dark:text-red-300 text-sm">
                          Ações nesta seção são irreversíveis. Por favor, proceda com cautela.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                            Aviso Importante
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            As ações abaixo não podem ser desfeitas. Certifique-se de que você realmente deseja continuar antes de prosseguir.
                          </p>
                        </div>
                      </div>
                    </div>

                    <DangerZone
                      userId={user?.uid || ''}
                      onAccountDeleted={() => {
                        if (updateUserContextProfile) updateUserContextProfile({});
                        router.push('/');
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Save Button - Only show when there are unsaved changes */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <button
                onClick={saveSettings}
                disabled={isSaving}
                className={`flex items-center px-6 py-3 rounded-full shadow-lg transition-all duration-200 ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl active:transform active:scale-95'
                } text-white font-medium`}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Component for the notifications tab */}
        {activeTab === 'notifications' && (
          <div className="mt-6">
            <Notifications 
              resolvedTheme={resolvedTheme} 
            />
          </div>
        )}
      </div>
    </div>
  );
}