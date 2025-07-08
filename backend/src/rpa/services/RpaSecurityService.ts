import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export interface EncryptedData {
  iv: string;
  encryptedData: string;
  salt: string;
}

export class RpaSecurityService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly saltLength = 16;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor() {
    // Verificar se a chave de criptografia está definida
    if (!process.env.RPA_ENCRYPTION_KEY) {
      console.warn('⚠️ RPA_ENCRYPTION_KEY não definida. Usando chave padrão (não recomendado para produção).');
    }
  }

  /**
   * Criptografa dados sensíveis (credenciais bancárias)
   */
  encryptCredentials(data: any): EncryptedData {
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);
    
    // Gerar chave a partir da senha e salt
    const key = this.deriveKey(process.env.RPA_ENCRYPTION_KEY || 'default-key', salt);
    
    // Criptografar dados
    const cipher = createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Obter tag de autenticação
    const tag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted + tag.toString('hex'),
      salt: salt.toString('hex')
    };
  }

  /**
   * Descriptografa dados sensíveis
   */
  decryptCredentials(encryptedData: EncryptedData): any {
    try {
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const encrypted = Buffer.from(encryptedData.encryptedData, 'hex');
      
      // Separar dados criptografados da tag
      const tag = encrypted.slice(-this.tagLength);
      const data = encrypted.slice(0, -this.tagLength);
      
      // Gerar chave
      const key = this.deriveKey(process.env.RPA_ENCRYPTION_KEY || 'default-key', salt);
      
      // Descriptografar
      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(data, null, 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Erro ao descriptografar dados: ${error.message}`);
    }
  }

  /**
   * Gera hash seguro para senhas
   */
  hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verifica senha
   */
  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const testHash = scryptSync(password, salt, 64).toString('hex');
    return hash === testHash;
  }

  /**
   * Valida credenciais bancárias
   */
  validateBankCredentials(credentials: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!credentials.username || credentials.username.trim().length < 3) {
      errors.push('Username deve ter pelo menos 3 caracteres');
    }

    if (!credentials.password || credentials.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (!credentials.bankUrl || !this.isValidUrl(credentials.bankUrl)) {
      errors.push('URL do banco inválida');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitiza dados de entrada
   */
  sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove caracteres perigosos
      .substring(0, 1000); // Limita tamanho
  }

  /**
   * Gera token de sessão seguro
   */
  generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Valida token de sessão
   */
  validateSessionToken(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * Log de auditoria
   */
  logAuditEvent(event: string, userId: string, details: any = {}): void {
    const auditLog = {
      timestamp: new Date().toISOString(),
      event,
      userId,
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    console.log('🔒 AUDIT LOG:', JSON.stringify(auditLog, null, 2));
    
    // Aqui você pode salvar no banco de dados ou enviar para um serviço de logs
  }

  private deriveKey(password: string, salt: Buffer): Buffer {
    return scryptSync(password, salt, this.keyLength);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith('https://');
    } catch {
      return false;
    }
  }

  /**
   * Verifica se o ambiente é seguro
   */
  checkSecurityEnvironment(): { isSecure: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (!process.env.RPA_ENCRYPTION_KEY) {
      warnings.push('RPA_ENCRYPTION_KEY não definida');
    }

    if (process.env.NODE_ENV === 'development') {
      warnings.push('Executando em ambiente de desenvolvimento');
    }

    if (!process.env.REDIS_PASSWORD) {
      warnings.push('Redis sem senha configurada');
    }

    return {
      isSecure: warnings.length === 0,
      warnings
    };
  }
} 