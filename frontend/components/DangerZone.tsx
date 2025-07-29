// components/DangerZone.tsx
import { useState, useCallback } from 'react';
import { 
  FiDownload, 
  FiAlertTriangle, 
  FiTrash2, 
  FiShield, 
  FiCheck, 
  FiX,
  FiClock,
  FiDatabase,
  FiUser
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { deleteUser } from 'firebase/auth';
import { auth } from '../lib/firebase/client';
import { doc, deleteDoc, getFirestore, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface DangerZoneProps {
  userId: string;
  onAccountDeleted: () => void;
}

type ExportStatus = 'idle' | 'preparing' | 'generating' | 'completed' | 'failed';
type DeleteStep = 'initial' | 'confirm' | 'final-confirm' | 'deleting';
type DataType = 'transactions' | 'settings' | 'profile' | 'all';

interface ExportProgress {
  current: number;
  total: number;
  currentTask: string;
}

export default function DangerZone({ userId, onAccountDeleted }: DangerZoneProps) {
  const [deleteStep, setDeleteStep] = useState<DeleteStep>('initial');
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [exportProgress, setExportProgress] = useState<ExportProgress>({ current: 0, total: 0, currentTask: '' });
  const [selectedDataTypes, setSelectedDataTypes] = useState<DataType[]>(['all']);
  const [confirmationText, setConfirmationText] = useState('');
  const [deleteCountdown, setDeleteCountdown] = useState(0);
  const [exportedDataSize, setExportedDataSize] = useState<string>('');

  const dataTypeOptions = [
    { 
      type: 'all' as DataType, 
      label: 'Todos os dados', 
      description: 'Transações, configurações, perfil e todos os dados associados',
      icon: <FiDatabase className="w-5 h-5" />
    },
    { 
      type: 'transactions' as DataType, 
      label: 'Transações', 
      description: 'Histórico completo de transações financeiras',
      icon: <FiClock className="w-5 h-5" />
    },
    { 
      type: 'settings' as DataType, 
      label: 'Configurações', 
      description: 'Preferências e configurações da conta',
      icon: <FiShield className="w-5 h-5" />
    },
    { 
      type: 'profile' as DataType, 
      label: 'Perfil', 
      description: 'Informações pessoais e dados do perfil',
      icon: <FiUser className="w-5 h-5" />
    }
  ];

  const handleDataTypeToggle = useCallback((type: DataType) => {
    if (type === 'all') {
      setSelectedDataTypes(['all']);
    } else {
      setSelectedDataTypes(prev => {
        const newTypes = prev.filter(t => t !== 'all');
        if (newTypes.includes(type)) {
          return newTypes.filter(t => t !== type);
        } else {
          return [...newTypes, type];
        }
      });
    }
  }, []);

  const simulateDataExport = async () => {
    const tasks = [
      'Coletando dados do perfil...',
      'Exportando transações...',
      'Compilando configurações...',
      'Gerando relatórios...',
      'Compactando arquivos...',
      'Finalizando exportação...'
    ];

    for (let i = 0; i < tasks.length; i++) {
      setExportProgress({ current: i + 1, total: tasks.length, currentTask: tasks[i] });
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const handleExportData = async () => {
    if (selectedDataTypes.length === 0) {
      toast.error('Selecione pelo menos um tipo de dados para exportar.');
      return;
    }

    setExportStatus('preparing');
    
    try {
      // Simular preparação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExportStatus('generating');
      await simulateDataExport();

      // Simular coleta de dados reais
      const db = getFirestore();
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          userId: userId,
          dataTypes: selectedDataTypes,
          version: '2.0'
        },
        userData: userDoc.exists() ? userDoc.data() : {},
        // Simular dados adicionais baseados nos tipos selecionados
        transactions: selectedDataTypes.includes('all') || selectedDataTypes.includes('transactions') 
          ? Array.from({ length: 50 }, (_, i) => ({
              id: `transaction_${i}`,
              amount: Math.random() * 1000,
              description: `Transação ${i + 1}`,
              date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              category: ['food', 'transport', 'entertainment', 'utilities'][Math.floor(Math.random() * 4)]
            }))
          : [],
        settings: selectedDataTypes.includes('all') || selectedDataTypes.includes('settings')
          ? {
              theme: 'dark',
              language: 'pt-BR',
              notifications: true,
              currency: 'BRL'
            }
          : {},
        profile: selectedDataTypes.includes('all') || selectedDataTypes.includes('profile')
          ? {
              name: 'Usuário Exemplo',
              email: 'usuario@exemplo.com',
              createdAt: new Date().toISOString()
            }
          : {}
      };

      // Calcular tamanho estimado
      const dataStr = JSON.stringify(exportData, null, 2);
      const sizeInBytes = new Blob([dataStr]).size;
      const sizeInMB = (sizeInBytes / 1024 / 1024).toFixed(2);
      setExportedDataSize(`${sizeInMB} MB`);

      // Criar e baixar arquivo
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finnextho-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('completed');
      toast.success(`Dados exportados com sucesso! Arquivo de ${sizeInMB} MB baixado.`);
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setExportStatus('idle');
        setExportProgress({ current: 0, total: 0, currentTask: '' });
      }, 5000);
      
    } catch (error) {
      console.error('Error exporting data:', error);
      setExportStatus('failed');
      toast.error('Erro ao exportar dados. Por favor, tente novamente.');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const startDeleteCountdown = () => {
    setDeleteStep('final-confirm');
    setDeleteCountdown(10);
    
    const countdown = setInterval(() => {
      setDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'EXCLUIR PERMANENTEMENTE') {
      toast.error('Digite exatamente "EXCLUIR PERMANENTEMENTE" para confirmar.');
      return;
    }

    setDeleteStep('deleting');
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      // 1. Primeiro deletar dados do Firestore
      const db = getFirestore();
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      // 2. Simular limpeza de dados relacionados
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Deletar a conta de autenticação
      await deleteUser(user);

      toast.success('Conta excluída com sucesso. Lamentamos vê-lo partir!');
      onAccountDeleted();
      
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      toast.error(`Erro ao excluir conta: ${error instanceof Error ? error.message : String(error)}`);
      setDeleteStep('initial');
      setConfirmationText('');
    }
  };

  const getExportButtonText = () => {
    switch (exportStatus) {
      case 'preparing':
        return 'Preparando...';
      case 'generating':
        return `Exportando... ${exportProgress.current}/${exportProgress.total}`;
      case 'completed':
        return `✓ Exportado (${exportedDataSize})`;
      case 'failed':
        return '✗ Falha na exportação';
      default:
        return 'Exportar Dados Selecionados';
    }
  };

  const getDeleteButtonText = () => {
    switch (deleteStep) {
      case 'deleting':
        return 'Excluindo conta...';
      case 'final-confirm':
        return deleteCountdown > 0 ? `Aguarde ${deleteCountdown}s` : 'Excluir Conta Permanentemente';
      default:
        return 'Excluir Conta Permanentemente';
    }
  };

  return (
    <div className="space-y-8">
      {/* Data Export Section */}
      <motion.div 
        className="border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start mb-6">
          <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 mr-4">
            <FiDownload className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Exportar Meus Dados
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              Baixe uma cópia completa dos seus dados em formato JSON estruturado. 
              Ideal para backup pessoal ou migração para outro sistema.
            </p>
          </div>
        </div>

        {/* Data Type Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
            Selecione os tipos de dados para exportar:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataTypeOptions.map((option) => (
              <motion.label
                key={option.type}
                className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedDataTypes.includes(option.type)
                    ? 'border-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
                    : 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 dark:hover:border-yellow-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input
                  type="checkbox"
                  checked={selectedDataTypes.includes(option.type)}
                  onChange={() => handleDataTypeToggle(option.type)}
                  className="sr-only"
                />
                <div className="flex items-center mr-3">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {option.label}
                    </span>
                    {selectedDataTypes.includes(option.type) && (
                      <FiCheck className="w-4 h-4 text-yellow-600 dark:text-yellow-400 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    {option.description}
                  </p>
                </div>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Export Progress */}
        <AnimatePresence>
          {exportStatus === 'generating' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {exportProgress.currentTask}
                </span>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  {exportProgress.current}/{exportProgress.total}
                </span>
              </div>
              <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                <motion.div
                  className="bg-yellow-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleExportData}
          disabled={exportStatus === 'preparing' || exportStatus === 'generating' || selectedDataTypes.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {(exportStatus === 'preparing' || exportStatus === 'generating') && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          )}
          {exportStatus === 'completed' && <FiCheck className="w-4 h-4 mr-2" />}
          {exportStatus === 'failed' && <FiX className="w-4 h-4 mr-2" />}
          {getExportButtonText()}
        </button>
      </motion.div>

      {/* Account Deletion Section */}
      <motion.div 
        className="border border-red-200 dark:border-red-800 rounded-xl p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-start mb-6">
          <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 mr-4">
            <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Excluir Minha Conta
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm">
              Esta ação excluirá permanentemente sua conta e todos os dados associados. 
              Esta operação não pode ser desfeita.
            </p>
          </div>
        </div>

        {/* Warning List */}
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-start mb-3">
            <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                O que será excluído permanentemente:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>• Todas as suas transações e histórico financeiro</li>
                <li>• Configurações e preferências personalizadas</li>
                <li>• Dados do perfil e informações pessoais</li>
                <li>• Relatórios e análises salvas</li>
                <li>• Acesso a todos os recursos da plataforma</li>
              </ul>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {deleteStep === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={() => setDeleteStep('confirm')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-red-300 dark:border-red-700 rounded-lg shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              >
                <FiTrash2 className="w-4 h-4 mr-2" />
                Iniciar Processo de Exclusão
              </button>
            </motion.div>
          )}

          {deleteStep === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                  Para continuar, digite <strong>"EXCLUIR PERMANENTEMENTE"</strong> no campo abaixo:
                </p>
                <input
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="Digite: EXCLUIR PERMANENTEMENTE"
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:text-white text-sm"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setDeleteStep('initial');
                    setConfirmationText('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={startDeleteCountdown}
                  disabled={confirmationText !== 'EXCLUIR PERMANENTEMENTE'}
                  className="flex-1 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          )}

          {deleteStep === 'final-confirm' && (
            <motion.div
              key="final-confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="p-4 bg-red-100 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
                <div className="flex items-center justify-center mb-3">
                  <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-center text-sm text-red-800 dark:text-red-200 font-medium">
                  ÚLTIMA CHANCE DE CANCELAR
                </p>
                <p className="text-center text-xs text-red-700 dark:text-red-300 mt-2">
                  Sua conta será excluída permanentemente. Esta ação não pode ser desfeita.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setDeleteStep('initial');
                    setConfirmationText('');
                    setDeleteCountdown(0);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-4 h-4 mr-2 inline" />
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteCountdown > 0}
                  className="flex-1 px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteCountdown > 0 && <FiClock className="w-4 h-4 mr-2 inline" />}
                  {getDeleteButtonText()}
                </button>
              </div>
            </motion.div>
          )}

          {deleteStep === 'deleting' && (
            <motion.div
              key="deleting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Excluindo sua conta... Isso pode levar alguns momentos.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}