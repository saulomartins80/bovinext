// backend/src/controllers/storageController.ts
import { Request, Response } from 'express';
import { storageService } from '../services/StorageService';
import multer from 'multer';

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de arquivo permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

export const uploadMiddleware = upload.single('file');

/**
 * Upload de arquivo do usuário
 */
export const uploadUserFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado' });
      return;
    }

    const { originalname, buffer, mimetype } = req.file;
    const { folder = 'documents' } = req.body;

    // Criar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `users/${userId}/${folder}/${timestamp}_${originalname}`;

    const downloadURL = await storageService.uploadFile(
      buffer,
      fileName,
      mimetype,
      {
        userId,
        originalName: originalname,
        uploadDate: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      downloadURL,
      fileName: originalname,
      size: buffer.length
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Listar arquivos do usuário
 */
export const getUserFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { prefix } = req.query;
    const files = await storageService.listUserFiles(userId, prefix as string);

    res.json({
      success: true,
      files
    });

  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Deletar arquivo do usuário
 */
export const deleteUserFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { fileName } = req.params;
    if (!fileName) {
      res.status(400).json({ error: 'Nome do arquivo é obrigatório' });
      return;
    }

    // Verificar se o arquivo pertence ao usuário
    if (!fileName.startsWith(`users/${userId}/`)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    await storageService.deleteUserFile(userId, fileName.replace(`users/${userId}/`, ''));

    res.json({
      success: true,
      message: 'Arquivo deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Obter URL assinada para arquivo privado
 */
export const getSignedURL = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { fileName } = req.params;
    const { expiresInMinutes = 60 } = req.query;

    if (!fileName) {
      res.status(400).json({ error: 'Nome do arquivo é obrigatório' });
      return;
    }

    // Verificar se o arquivo pertence ao usuário
    if (!fileName.startsWith(`users/${userId}/`)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    const signedURL = await storageService.getSignedURL(
      fileName, 
      parseInt(expiresInMinutes as string)
    );

    res.json({
      success: true,
      signedURL,
      expiresIn: expiresInMinutes
    });

  } catch (error) {
    console.error('Erro ao obter URL assinada:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Fazer backup dos dados do usuário
 */
export const backupUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    // Aqui você pode coletar todos os dados do usuário
    // Por exemplo: transações, metas, investimentos, etc.
    const userData = {
      userId,
      backupDate: new Date().toISOString(),
      // Adicionar dados do usuário aqui
      profile: req.user,
      // transacoes: await getTransacoesByUserId(userId),
      // metas: await getMetasByUserId(userId),
      // investimentos: await getInvestimentosByUserId(userId),
    };

    const downloadURL = await storageService.backupUserData(userId, userData);

    res.json({
      success: true,
      downloadURL,
      message: 'Backup criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Obter estatísticas de uso do storage
 */
export const getStorageStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const stats = await storageService.getUserStorageStats(userId);

    res.json({
      success: true,
      stats: {
        ...stats,
        totalSizeMB: (stats.totalSize / 1024 / 1024).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Limpar arquivos temporários antigos
 */
export const cleanupOldFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const { olderThanDays = 30 } = req.query;
    const deletedCount = await storageService.cleanupOldFiles(
      userId, 
      parseInt(olderThanDays as string)
    );

    res.json({
      success: true,
      deletedCount,
      message: `${deletedCount} arquivos antigos foram removidos`
    });

  } catch (error) {
    console.error('Erro na limpeza:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};
