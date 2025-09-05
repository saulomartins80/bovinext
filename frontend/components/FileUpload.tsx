// frontend/components/FileUpload.tsx
/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useRef, useCallback } from 'react';
import { Plus, X, FileText, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { storageService, UploadProgress } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

interface FileUploadProps {
  onUploadComplete?: (downloadURL: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // em bytes
  uploadType: 'avatar' | 'document' | 'general';
  documentType?: string; // para documentos financeiros
  className?: string;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: UploadProgress;
  downloadURL?: string;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  acceptedTypes = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB padrão
  uploadType,
  documentType,
  className = "",
  disabled = false
 /* eslint-disable jsx-a11y/alt-text */
}) => {
  const { user } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Validar tamanho
    if (file.size > maxSize) {
      return `Arquivo muito grande. Máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }

    // Validar tipo para avatar
    if (uploadType === 'avatar' && !file.type.startsWith('image/')) {
      return 'Apenas imagens são permitidas para avatar';
    }

    // Validar tamanho específico para avatar
    if (uploadType === 'avatar' && file.size > 5 * 1024 * 1024) {
      return 'Avatar deve ter no máximo 5MB';
    }

    return null;
  }, [maxSize, uploadType]);

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!user || !storageService.isAvailable()) {
      onUploadError?.('Usuário não autenticado ou Storage não disponível');
      return;
    }

    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        onUploadError?.(validationError);
        continue;
      }

      const uploadingFile: UploadingFile = {
        file,
        progress: {
          bytesTransferred: 0,
          totalBytes: file.size,
          progress: 0,
          state: 'running'
        }
      };

      setUploadingFiles(prev => [...prev, uploadingFile]);

      try {
        let downloadURL: string;

        if (uploadType === 'avatar') {
          downloadURL = await storageService.uploadAvatar(file, user.uid);
        } else if (uploadType === 'document' && documentType) {
          downloadURL = await storageService.uploadDocumentWithProgress(
            file,
            user.uid,
            documentType,
            (progress) => {
              setUploadingFiles(prev => 
                prev.map(uf => 
                  uf.file === file 
                    ? { ...uf, progress }
                    : uf
                )
              );
            }
          );
        } else {
          // Upload geral
          const path = `users/${user.uid}/${Date.now()}_${file.name}`;
          downloadURL = await storageService.uploadFile(
            file,
            path,
            (progress) => {
              setUploadingFiles(prev => 
                prev.map(uf => 
                  uf.file === file 
                    ? { ...uf, progress }
                    : uf
                )
              );
            }
          );
        }

        // Atualizar estado com sucesso
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { 
                  ...uf, 
                  downloadURL,
                  progress: { ...uf.progress, state: 'success', progress: 100 }
                }
              : uf
          )
        );

        onUploadComplete?.(downloadURL, file.name);

        // Remover da lista após 3 segundos
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(uf => uf.file !== file));
        }, 3000);

      } catch (error) {
        console.error('Erro no upload:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro no upload';
        
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { 
                  ...uf, 
                  error: errorMessage,
                  progress: { ...uf.progress, state: 'error' }
                }
              : uf
          )
        );

        onUploadError?.(errorMessage);
      }
    }
  }, [user, uploadType, documentType, validateFile, onUploadComplete, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Limpar input para permitir reenvio do mesmo arquivo
    e.target.value = '';
  }, [handleFileSelect]);

  const removeUploadingFile = useCallback((file: File) => {
    setUploadingFiles(prev => prev.filter(uf => uf.file !== file));
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUploadTypeLabel = (): string => {
    switch (uploadType) {
      case 'avatar': return 'avatar';
      case 'document': return 'documento';
      default: return 'arquivo';
    }
  };

  if (!storageService.isAvailable()) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <p className="text-yellow-800">
            Firebase Storage não está disponível no momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
          multiple={uploadType !== 'avatar'}
        />
        
        <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Clique para selecionar ou arraste {uploadType === 'avatar' ? 'uma imagem' : 'arquivos'}
        </p>
        <p className="text-sm text-gray-500">
          {uploadType === 'avatar' 
            ? 'PNG, JPG até 5MB'
            : `Máximo ${(maxSize / 1024 / 1024).toFixed(1)}MB por arquivo`
          }
        </p>
      </div>

      {/* Lista de Arquivos em Upload */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Enviando {getUploadTypeLabel()}s:
          </h4>
          
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {uploadingFile.file.type.startsWith('image/') ? (
                    <Image className="h-5 w-5 text-blue-500 mr-2" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {uploadingFile.file.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({formatFileSize(uploadingFile.file.size)})
                  </span>
                </div>
                
                <div className="flex items-center">
                  {uploadingFile.progress.state === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  {uploadingFile.error && (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <button
                    onClick={() => removeUploadingFile(uploadingFile.file)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Barra de Progresso */}
              {uploadingFile.progress.state === 'running' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadingFile.progress.progress}%` }}
                  />
                </div>
              )}
              
              {/* Status */}
              <div className="text-xs text-gray-600">
                {uploadingFile.error ? (
                  <span className="text-red-600">Erro: {uploadingFile.error}</span>
                ) : uploadingFile.progress.state === 'success' ? (
                  <span className="text-green-600">✓ Upload concluído</span>
                ) : (
                  <span>
                    {uploadingFile.progress.progress.toFixed(1)}% - 
                    {formatFileSize(uploadingFile.progress.bytesTransferred)} / 
                    {formatFileSize(uploadingFile.progress.totalBytes)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
