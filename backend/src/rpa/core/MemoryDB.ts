/***************************************
 * 💾 MEMORY DB - BANCO EM MEMÓRIA
 * (Sistema de persistência local)
 ***************************************/

export class MemoryDB {
  private store = new Map<string, any>();
  private backupFile = './logs/memory-db-backup.json';
  private subscribers: Record<string, Function[]> = {};
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.loadBackup();
      this.startAutoBackup();
      this.isInitialized = true;
      console.log('💾 MemoryDB inicializado com sucesso');
    } catch (error) {
      console.warn('⚠️ Erro ao inicializar MemoryDB:', error);
    }
  }

  // 🎯 OPERAÇÕES BÁSICAS
  set(key: string, value: any): void {
    this.store.set(key, {
      value,
      timestamp: new Date(),
      version: this.getVersion(key) + 1
    });
    
    this.notifySubscribers(key, value);
  }

  get(key: string): any {
    const data = this.store.get(key);
    return data ? data.value : undefined;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      this.notifySubscribers(key, null);
    }
    return deleted;
  }

  clear(): void {
    this.store.clear();
    console.log('🧹 MemoryDB limpo');
  }

  // 📊 MÉTRICAS
  size(): number {
    return this.store.size;
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  values(): any[] {
    return Array.from(this.store.values()).map(data => data.value);
  }

  entries(): [string, any][] {
    return Array.from(this.store.entries()).map(([key, data]) => [key, data.value]);
  }

  // 🔍 BUSCA AVANÇADA
  find(pattern: RegExp): [string, any][] {
    return this.entries().filter(([key]) => pattern.test(key));
  }

  findByValue(predicate: (value: any) => boolean): [string, any][] {
    return this.entries().filter(([, value]) => predicate(value));
  }

  // 📡 PUB/SUB
  subscribe(key: string, callback: (value: any) => void): void {
    if (!this.subscribers[key]) {
      this.subscribers[key] = [];
    }
    this.subscribers[key].push(callback);
  }

  unsubscribe(key: string, callback: (value: any) => void): void {
    if (this.subscribers[key]) {
      this.subscribers[key] = this.subscribers[key].filter(cb => cb !== callback);
    }
  }

  private notifySubscribers(key: string, value: any): void {
    if (this.subscribers[key]) {
      this.subscribers[key].forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.warn('⚠️ Erro no callback do subscriber:', error);
        }
      });
    }
  }

  // 💾 PERSISTÊNCIA
  private async saveBackup(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const data = Array.from(this.store.entries());
      await fs.writeFile(this.backupFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('⚠️ Erro ao salvar backup:', error);
    }
  }

  private async loadBackup(): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const fsExists = await import('fs').then(fs => fs.existsSync);
      
      if (fsExists(this.backupFile)) {
        const data = await fs.readFile(this.backupFile, 'utf-8');
        const entries = JSON.parse(data);
        this.store = new Map(entries);
        console.log(`📂 Backup carregado: ${this.store.size} entradas`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar backup:', error);
    }
  }

  private startAutoBackup(): void {
    setInterval(() => {
      this.saveBackup();
    }, 60000); // Backup a cada 1 minuto
  }

  // 🔄 VERSIONAMENTO
  private getVersion(key: string): number {
    const data = this.store.get(key);
    return data ? data.version : 0;
  }

  getVersionInfo(key: string): { version: number; timestamp: Date } | null {
    const data = this.store.get(key);
    return data ? { version: data.version, timestamp: data.timestamp } : null;
  }

  // 🗂️ OPERAÇÕES EM LOTE
  setMultiple(entries: Record<string, any>): void {
    Object.entries(entries).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  getMultiple(keys: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    keys.forEach(key => {
      const value = this.get(key);
      if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }

  deleteMultiple(keys: string[]): number {
    let deletedCount = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });
    return deletedCount;
  }

  // 🔍 FILTROS AVANÇADOS
  filterByPrefix(prefix: string): [string, any][] {
    return this.entries().filter(([key]) => key.startsWith(prefix));
  }

  filterBySuffix(suffix: string): [string, any][] {
    return this.entries().filter(([key]) => key.endsWith(suffix));
  }

  filterByAge(maxAgeMs: number): [string, any][] {
    const cutoff = new Date(Date.now() - maxAgeMs);
    return this.entries().filter(([key]) => {
      const versionInfo = this.getVersionInfo(key);
      return versionInfo && versionInfo.timestamp > cutoff;
    });
  }

  // 📈 ESTATÍSTICAS
  getStats(): {
    totalEntries: number;
    totalSize: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    averageValueSize: number;
  } {
    const entries = Array.from(this.store.values());
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
        averageValueSize: 0
      };
    }

    const timestamps = entries.map(e => e.timestamp);
    const valueSizes = entries.map(e => JSON.stringify(e.value).length);

    return {
      totalEntries: entries.length,
      totalSize: valueSizes.reduce((sum, size) => sum + size, 0),
      oldestEntry: new Date(Math.min(...timestamps.map(t => t.getTime()))),
      newestEntry: new Date(Math.max(...timestamps.map(t => t.getTime()))),
      averageValueSize: valueSizes.reduce((sum, size) => sum + size, 0) / valueSizes.length
    };
  }

  // 🧹 LIMPEZA AUTOMÁTICA
  cleanup(maxAgeMs: number): number {
    const cutoff = new Date(Date.now() - maxAgeMs);
    const keysToDelete: string[] = [];

    this.store.forEach((data, key) => {
      if (data.timestamp < cutoff) {
        keysToDelete.push(key);
      }
    });

    return this.deleteMultiple(keysToDelete);
  }

  // 🔄 MIGRAÇÃO
  async migrateToFile(filename: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const data = Array.from(this.store.entries());
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      console.log(`📁 Dados migrados para: ${filename}`);
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      throw error;
    }
  }

  async loadFromFile(filename: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(filename, 'utf-8');
      const entries = JSON.parse(data);
      this.store = new Map(entries);
      console.log(`📂 Dados carregados de: ${filename}`);
    } catch (error) {
      console.error('❌ Erro ao carregar arquivo:', error);
      throw error;
    }
  }

  // 🎯 OPERAÇÕES ESPECÍFICAS PARA RPA
  setRpaData(key: string, data: any, ttl?: number): void {
    const entry = {
      value: data,
      timestamp: new Date(),
      version: this.getVersion(key) + 1,
      ttl: ttl ? Date.now() + ttl : undefined
    };
    
    this.store.set(key, entry);
    this.notifySubscribers(key, data);
  }

  getRpaData(key: string): any {
    const data = this.store.get(key);
    if (!data) return undefined;

    // Verificar TTL
    if (data.ttl && Date.now() > data.ttl) {
      this.store.delete(key);
      return undefined;
    }

    return data.value;
  }

  // 🔍 BUSCA ESPECÍFICA PARA RPA
  findRpaTasks(status?: string): [string, any][] {
    return this.findByValue(value => {
      if (typeof value === 'object' && value !== null) {
        return value.type === 'RPA_TASK' && (!status || value.status === status);
      }
      return false;
    });
  }

  findRpaErrors(): [string, any][] {
    return this.findByValue(value => {
      if (typeof value === 'object' && value !== null) {
        return value.type === 'RPA_ERROR' || value.error;
      }
      return false;
    });
  }

  // 📊 MÉTRICAS ESPECÍFICAS PARA RPA
  getRpaStats(): {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    pendingTasks: number;
    averageExecutionTime: number;
  } {
    const tasks = this.findRpaTasks();
    const taskData = tasks.map(([, task]) => task);

    return {
      totalTasks: taskData.length,
      completedTasks: taskData.filter(t => t.status === 'COMPLETED').length,
      failedTasks: taskData.filter(t => t.status === 'FAILED').length,
      pendingTasks: taskData.filter(t => t.status === 'PENDING').length,
      averageExecutionTime: taskData.reduce((sum, t) => sum + (t.executionTime || 0), 0) / taskData.length
    };
  }
}

// Exportar instância global
export const db = new MemoryDB(); 