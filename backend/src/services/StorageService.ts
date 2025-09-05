// backend/src/services/StorageService.ts
import { adminStorage } from '../config/firebaseAdmin';
import { Bucket } from '@google-cloud/storage';

export interface FileMetadata {
  name: string;
  bucket: string;
  generation: string | number;
  size: number;
  timeCreated: string;
  updated: string;
  contentType?: string;
  downloadURL?: string;
}

class StorageService {
  private bucket: Bucket;

  constructor() {
    this.bucket = adminStorage.bucket();
  }

  /**
   * Upload de arquivo via backend (para operações administrativas)
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType?: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    const file = this.bucket.file(fileName);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: contentType || 'application/octet-stream',
        metadata: metadata || {}
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Erro no upload:', error);
        reject(error);
      });

      stream.on('finish', async () => {
        try {
          // Tornar o arquivo público se necessário
          await file.makePublic();
          const downloadURL = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
          resolve(downloadURL);
        } catch (error) {
          console.error('Erro ao tornar arquivo público:', error);
          reject(error);
        }
      });

      stream.end(buffer);
    });
  }

  /**
   * Upload de arquivo público (logos, etc.)
   */
  async uploadPublicFile(
    buffer: Buffer,
    fileName: string,
    contentType?: string
  ): Promise<string> {
    const publicPath = `public/${fileName}`;
    return await this.uploadFile(buffer, publicPath, contentType);
  }

  /**
   * Deletar arquivo
   */
  async deleteFile(fileName: string): Promise<void> {
    const file = this.bucket.file(fileName);
    await file.delete();
  }

  /**
   * Obter URL de download assinada (para arquivos privados)
   */
  async getSignedURL(
    fileName: string,
    expiresInMinutes: number = 60
  ): Promise<string> {
    const file = this.bucket.file(fileName);
    const expires = Date.now() + (expiresInMinutes * 60 * 1000);
    
    const [signedURL] = await file.getSignedUrl({
      action: 'read',
      expires
    });

    return signedURL;
  }

  /**
   * Listar arquivos de um usuário
   */
  async listUserFiles(userId: string, prefix?: string): Promise<FileMetadata[]> {
    const userPrefix = prefix ? `users/${userId}/${prefix}` : `users/${userId}/`;
    
    const [files] = await this.bucket.getFiles({
      prefix: userPrefix
    });

    const fileMetadata: FileMetadata[] = [];

    for (const file of files) {
      const [metadata] = await file.getMetadata();
      
      fileMetadata.push({
        name: metadata.name,
        bucket: metadata.bucket,
        generation: metadata.generation,
        size: typeof metadata.size === 'string' ? parseInt(metadata.size) : metadata.size,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
        contentType: metadata.contentType
      });
    }

    return fileMetadata;
  }

  /**
   * Listar documentos de um usuário
   */
  async listUserDocuments(userId: string): Promise<FileMetadata[]> {
    return await this.listUserFiles(userId, 'documents');
  }

  /**
   * Deletar arquivo de usuário
   */
  async deleteUserFile(userId: string, fileName: string): Promise<void> {
    const filePath = `users/${userId}/${fileName}`;
    await this.deleteFile(filePath);
  }

  /**
   * Fazer backup dos dados do usuário
   */
  async backupUserData(userId: string, data: any): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backups/${userId}/backup_${timestamp}.json`;
    const buffer = Buffer.from(JSON.stringify(data, null, 2));
    
    return await this.uploadFile(buffer, fileName, 'application/json', {
      userId,
      backupDate: new Date().toISOString(),
      type: 'user_data_backup'
    });
  }

  /**
   * Verificar se arquivo existe
   */
  async fileExists(fileName: string): Promise<boolean> {
    const file = this.bucket.file(fileName);
    const [exists] = await file.exists();
    return exists;
  }

  /**
   * Obter metadados de um arquivo
   */
  async getFileMetadata(fileName: string): Promise<FileMetadata | null> {
    const file = this.bucket.file(fileName);
    const [exists] = await file.exists();
    
    if (!exists) {
      return null;
    }

    const [metadata] = await file.getMetadata();
    
    return {
      name: metadata.name,
      bucket: metadata.bucket,
      generation: metadata.generation,
      size: typeof metadata.size === 'string' ? parseInt(metadata.size) : metadata.size,
      timeCreated: metadata.timeCreated,
      updated: metadata.updated,
      contentType: metadata.contentType
    };
  }

  /**
   * Mover arquivo
   */
  async moveFile(sourceFileName: string, destFileName: string): Promise<void> {
    const sourceFile = this.bucket.file(sourceFileName);
    const destFile = this.bucket.file(destFileName);
    
    await sourceFile.move(destFile);
  }

  /**
   * Copiar arquivo
   */
  async copyFile(sourceFileName: string, destFileName: string): Promise<void> {
    const sourceFile = this.bucket.file(sourceFileName);
    const destFile = this.bucket.file(destFileName);
    
    await sourceFile.copy(destFile);
  }

  /**
   * Obter estatísticas de uso do storage por usuário
   */
  async getUserStorageStats(userId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    documents: number;
    avatars: number;
    backups: number;
  }> {
    const files = await this.listUserFiles(userId);
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      documents: 0,
      avatars: 0,
      backups: 0
    };

    files.forEach(file => {
      if (file.name.includes('/documents/')) {
        stats.documents++;
      } else if (file.name.includes('/avatars/')) {
        stats.avatars++;
      } else if (file.name.includes('/backups/')) {
        stats.backups++;
      }
    });

    return stats;
  }

  /**
   * Limpar arquivos antigos (older than X days)
   */
  async cleanupOldFiles(userId: string, olderThanDays: number = 30): Promise<number> {
    const files = await this.listUserFiles(userId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    let deletedCount = 0;
    
    for (const file of files) {
      const fileDate = new Date(file.timeCreated);
      
      if (fileDate < cutoffDate && file.name.includes('/temp/')) {
        try {
          await this.deleteFile(file.name);
          deletedCount++;
        } catch (error) {
          console.error(`Erro ao deletar arquivo ${file.name}:`, error);
        }
      }
    }
    
    return deletedCount;
  }
}

export const storageService = new StorageService();
export default storageService;
