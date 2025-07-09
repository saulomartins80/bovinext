import crypto from 'crypto';
import winston from 'winston';

export class EnhancedSecurityService {
  private readonly encryptionKey: string;
  private readonly ivLength: number = 16;
  private readonly algorithm: string = 'aes-256-cbc';
  private logger: winston.Logger;

  constructor() {
    this.encryptionKey = process.env.RPA_ENCRYPTION_KEY || '';
    if (!this.encryptionKey || this.encryptionKey.length !== 32) {
      throw new Error('RPA_ENCRYPTION_KEY deve ter exatamente 32 caracteres');
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'enhanced-security' },
      transports: [
        new winston.transports.File({ filename: 'logs/rpa-security.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  async encryptData(data: string): Promise<string> {
    try {
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey),
        iv
      );
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const result = `${iv.toString('hex')}:${encrypted}`;
      this.logger.info('🔐 Dados criptografados com sucesso');
      
      return result;
    } catch (error) {
      this.logger.error('❌ Erro na criptografia:', error);
      throw new Error('Falha na criptografia dos dados');
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    try {
      const [ivHex, encryptedHex] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey),
        iv
      );
      
      let decrypted = decipher.update(encrypted, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      this.logger.info('🔓 Dados descriptografados com sucesso');
      return decrypted;
    } catch (error) {
      this.logger.error('❌ Erro na descriptografia:', error);
      throw new Error('Falha na descriptografia dos dados');
    }
  }

  validateInput(data: any): boolean {
    // Sanitização de entrada
    if (typeof data === 'string') {
      // Remove caracteres perigosos
      const sanitized = data.replace(/[<>\"'&]/g, '');
      return sanitized.length > 0 && sanitized.length < 10000;
    }
    
    if (typeof data === 'object') {
      return this.validateObject(data);
    }
    
    return false;
  }

  private validateObject(obj: any): boolean {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && !this.validateInput(value)) {
        return false;
      }
      if (typeof value === 'object' && !this.validateObject(value)) {
        return false;
      }
    }
    return true;
  }

  generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }
} 