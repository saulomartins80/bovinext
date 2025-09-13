// frontend/pages/arquivos.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import { storageService, FileMetadata } from '../services/storageService';
import { toast } from 'react-toastify';

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  totalSizeMB: string;
  documents: number;
  avatars: number;
  backups: number;
}

export default function Arquivos() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'documents' | 'images' | 'backups'>('all');
  // const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      if (!user) return;

      // Remover backup automático daqui - será feito apenas quando solicitado
      // await storageService.backupUserData(user.uid, {});
      const userFiles = await storageService.getUserDocuments(user.uid);
      setFiles(userFiles);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      toast.error('Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadStats = useCallback(async () => {
    try {
      if (!user) return;

      const response = await fetch('/api/storage/stats', {
        headers: {
          'Authorization': `Bearer mock-token`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFiles();
      loadStats();
    }
  }, [user, loadFiles, loadStats]);

  const handleUploadComplete = (downloadURL: string, fileName: string) => {
    toast.success(`${fileName} enviado com sucesso!`);
    loadFiles();
    loadStats();
    setShowUpload(false);
  };

  const handleUploadError = (error: string) => {
    toast.error(error);
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm('Tem certeza que deseja deletar este arquivo?')) {
      return;
    }

    try {
      if (!user) return;

      const response = await fetch(`/api/storage/files/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer mock-token`
        }
      });

      if (response.ok) {
        toast.success('Arquivo deletado com sucesso!');
        loadFiles();
        loadStats();
      } else {
        throw new Error('Erro ao deletar arquivo');
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      toast.error('Erro ao deletar arquivo');
    }
  };

  const handleDownloadFile = async (file: FileMetadata) => {
    try {
      if (file.downloadURL) {
        window.open(file.downloadURL, '_blank');
      } else {
        toast.error('URL de download não disponível');
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error('Erro ao baixar arquivo');
    }
  };

  const handleBackupData = async () => {
    try {
      if (!user) return;

      const response = await fetch('/api/storage/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer mock-token`
        }
      });

      if (response.ok) {
        await response.json();
        toast.success('Backup criado com sucesso!');
        loadFiles();
        loadStats();
      } else {
        throw new Error('Erro ao criar backup');
      }
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast.error('Erro ao criar backup');
    }
  };

  const handleCleanupOldFiles = async () => {
    if (!confirm('Tem certeza que deseja limpar arquivos temporários antigos?')) {
      return;
    }

    try {
      if (!user) return;

      const response = await fetch('/api/storage/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer mock-token`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deletedCount} arquivos antigos foram removidos`);
        loadFiles();
        loadStats();
      } else {
        throw new Error('Erro na limpeza');
      }
    } catch (error) {
      console.error('Erro na limpeza:', error);
      toast.error('Erro na limpeza de arquivos');
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'documents') return matchesSearch && file.contentType?.includes('pdf');
    if (filterType === 'images') return matchesSearch && file.contentType?.startsWith('image/');
    if (filterType === 'backups') return matchesSearch && file.name.includes('backup');
    
    return matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (file: FileMetadata) => {
    if (file.contentType?.startsWith('image/')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  if (!storageService.isAvailable()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Serviço Indisponível
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            O Firebase Storage não está disponível no momento. 
            Verifique a configuração ou tente novamente mais tarde.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciamento de Arquivos
          </h1>
          <p className="text-gray-600">
            Gerencie seus documentos, imagens e backups de forma segura
          </p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total de Arquivos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalFiles}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Espaço Usado</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalSizeMB} MB
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Documentos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.documents}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Backups</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.backups}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Ações */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Enviar Arquivo
            </button>

            <button
              onClick={handleBackupData}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Criar Backup
            </button>

            <button
              onClick={handleCleanupOldFiles}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Arquivos Antigos
            </button>

            <button
              onClick={loadFiles}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Upload */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Enviar Novo Arquivo
            </h3>
            <FileUpload
              uploadType="document"
              documentType="general"
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              acceptedTypes="*/*"
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </motion.div>
        )}

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar arquivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'documents' | 'images' | 'backups')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Arquivos</option>
                <option value="documents">Documentos</option>
                <option value="images">Imagens</option>
                <option value="backups">Backups</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Arquivos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Carregando arquivos...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhum arquivo encontrado</p>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Tente ajustar sua busca' : 'Envie seu primeiro arquivo'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Arquivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamanho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file, index) => (
                    <motion.tr
                      key={file.fullPath}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(file)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.contentType}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(file.timeCreated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Baixar"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.fullPath)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Deletar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
