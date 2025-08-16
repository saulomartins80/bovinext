// Logs do Backend e Frontend
// Instruções de uso:
// 1. Apague todo o conteúdo abaixo desta linha
// 2. Cole seus logs aqui
// 3. Salve o arquivo
// 4. Me avise que salvou para eu analisar

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export const logs: LogEntry[] = [];

export default logs;

