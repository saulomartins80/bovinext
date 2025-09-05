// backend/src/routes/storageRoutes.ts
import { Router } from 'express';
import { 
  uploadUserFile,
  getUserFiles,
  deleteUserFile,
  getSignedURL,
  backupUserData,
  getStorageStats,
  cleanupOldFiles,
  uploadMiddleware
} from '../controllers/storageController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/storage/upload
 * @desc Upload de arquivo do usuário
 * @access Private
 */
router.post('/upload', uploadMiddleware, uploadUserFile);

/**
 * @route GET /api/storage/files
 * @desc Listar arquivos do usuário
 * @access Private
 */
router.get('/files', getUserFiles);

/**
 * @route DELETE /api/storage/files/:fileName
 * @desc Deletar arquivo do usuário
 * @access Private
 */
router.delete('/files/:fileName', deleteUserFile);

/**
 * @route GET /api/storage/signed-url/:fileName
 * @desc Obter URL assinada para arquivo privado
 * @access Private
 */
router.get('/signed-url/:fileName', getSignedURL);

/**
 * @route POST /api/storage/backup
 * @desc Fazer backup dos dados do usuário
 * @access Private
 */
router.post('/backup', backupUserData);

/**
 * @route GET /api/storage/stats
 * @desc Obter estatísticas de uso do storage
 * @access Private
 */
router.get('/stats', getStorageStats);

/**
 * @route POST /api/storage/cleanup
 * @desc Limpar arquivos temporários antigos
 * @access Private
 */
router.post('/cleanup', cleanupOldFiles);

export default router;
