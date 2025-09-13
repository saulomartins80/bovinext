// frontend/services/storageService.ts

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
  // Firebase removido — serviço indisponível no BOVINEXT
  private storage: null = null;

  isAvailable(): boolean { return false; }

  async uploadFile(_file: File, _path: string, _onProgress?: (progress: UploadProgress) => void): Promise<string> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async uploadFileSimple(_file: File, _path: string): Promise<string> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async uploadAvatar(_file: File, _userId: string): Promise<string> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async uploadDocument(_file: File, _userId: string, _documentType: string): Promise<string> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async uploadDocumentWithProgress(_file: File, _userId: string, _documentType: string, _onProgress?: (progress: UploadProgress) => void): Promise<string> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async deleteFile(_path: string): Promise<void> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async listFiles(_path: string): Promise<FileMetadata[]> {
    return [];
  }

  async getDownloadURL(_path: string): Promise<string> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async getFileMetadata(_path: string): Promise<FileMetadata> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async getUserDocuments(_userId: string): Promise<FileMetadata[]> {
    return [];
  }

  async deleteUserDocument(_userId: string, _fileName: string): Promise<void> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async backupUserData(_userId: string, _data: Record<string, unknown>): Promise<string> {
    throw new Error('Storage indisponível neste ambiente');
  }

  async getUserBackups(_userId: string): Promise<FileMetadata[]> {
    return [];
  }
}

export const storageService = new StorageService();
export default storageService;
