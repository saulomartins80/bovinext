// frontend/services/storageService.ts
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage';
import { getFirebaseStorage } from '../lib/firebase/client';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface FileMetadata {
  name: string;
  size: number;
  contentType?: string;
  downloadURL: string;
  fullPath: string;
  timeCreated: string;
  updated: string;
}

class StorageService {
  private storage = getFirebaseStorage();

  constructor() {
    if (!this.storage) {
      console.warn('⚠️ Firebase Storage não está disponível');
    }
  }

  /**
   * Verifica se o Storage está disponível
   */
  isAvailable(): boolean {
    return this.storage !== null;
  }

  /**
   * Upload de arquivo com progresso
   */
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    if (!this.storage) {
      throw new Error('Firebase Storage não está disponível');
    }

    const storageRef = ref(this.storage, path);
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as 'running' | 'paused' | 'success' | 'canceled' | 'error'
          };
          
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Erro no upload:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Upload simples de arquivo
   */
  async uploadFileSimple(file: File, path: string): Promise<string> {
    if (!this.storage) {
      throw new Error('Firebase Storage não está disponível');
    }

    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  /**
   * Upload de avatar do usuário
   */
  async uploadAvatar(file: File, userId: string): Promise<string> {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas imagens são permitidas para avatar');
    }

    // Validar tamanho (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Avatar deve ter no máximo 5MB');
    }

    const path = `avatars/${userId}`;
    return await this.uploadFileSimple(file, path);
  }

  /**
   * Upload de documento financeiro
   */
  async uploadDocument(file: File, userId: string, documentType: string): Promise<string> {
    // Validar tamanho (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Documento deve ter no máximo 10MB');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${documentType}_${timestamp}_${file.name}`;
    const path = `documents/${userId}/${fileName}`;
    
    return await this.uploadFileSimple(file, path);
  }

  /**
   * Upload com progresso para documentos
   */
  async uploadDocumentWithProgress(
    file: File, 
    userId: string, 
    documentType: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${documentType}_${timestamp}_${file.name}`;
    const path = `documents/${userId}/${fileName}`;
    
    return await this.uploadFile(file, path, onProgress);
  }

  /**
   * Deletar arquivo
   */
  async deleteFile(path: string): Promise<void> {
    if (!this.storage) {
      throw new Error('Firebase Storage não está disponível');
    }

    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }

  /**
   * Listar arquivos em um diretório
   */
  async listFiles(path: string): Promise<FileMetadata[]> {
    if (!this.storage) {
      throw new Error('Firebase Storage não está disponível');
    }

    const storageRef = ref(this.storage, path);
    const result = await listAll(storageRef);
    
    const files: FileMetadata[] = [];
    
    for (const item of result.items) {
      try {
        const metadata = await getMetadata(item);
        const downloadURL = await getDownloadURL(item);
        
        files.push({
          name: metadata.name,
          fullPath: metadata.fullPath,
          size: metadata.size,
          timeCreated: metadata.timeCreated,
          updated: metadata.updated,
          contentType: metadata.contentType,
          downloadURL
        });
      } catch (error) {
        console.error(`Erro ao obter metadados para ${item.fullPath}:`, error);
      }
    }
    
    return files;
  }

  /**
   * Obter URL de download
   */
  async getDownloadURL(path: string): Promise<string> {
    if (!this.storage) {
      throw new Error('Firebase Storage não está disponível');
    }

    const storageRef = ref(this.storage, path);
    return await getDownloadURL(storageRef);
  }

  /**
   * Obter metadados de um arquivo
   */
  async getFileMetadata(path: string): Promise<FileMetadata> {
    if (!this.storage) {
      throw new Error('Firebase Storage não está disponível');
    }

    const storageRef = ref(this.storage, path);
    const metadata = await getMetadata(storageRef);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      name: metadata.name,
      fullPath: metadata.fullPath,
      size: metadata.size,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
      contentType: metadata.contentType,
      downloadURL
    };
  }

  /**
   * Listar documentos do usuário
   */
  async getUserDocuments(userId: string): Promise<FileMetadata[]> {
    return await this.listFiles(`documents/${userId}`);
  }

  /**
   * Deletar documento do usuário
   */
  async deleteUserDocument(userId: string, fileName: string): Promise<void> {
    const path = `documents/${userId}/${fileName}`;
    await this.deleteFile(path);
  }

  /**
   * Fazer backup de dados do usuário
   */
  async backupUserData(userId: string, data: Record<string, unknown>): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup_${timestamp}.json`;
    const path = `backups/${userId}/${fileName}`;
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const file = new File([blob], fileName, { type: 'application/json' });
    
    return await this.uploadFileSimple(file, path);
  }

  /**
   * Listar backups do usuário
   */
  async getUserBackups(userId: string): Promise<FileMetadata[]> {
    return await this.listFiles(`backups/${userId}`);
  }
}

export const storageService = new StorageService();
export default storageService;
