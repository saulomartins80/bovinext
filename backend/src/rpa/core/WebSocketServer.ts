/***************************************
 * 📡 WEB SOCKET SERVER - COMUNICAÇÃO TEMPO REAL
 * (Servidor para mensagens em tempo real)
 ***************************************/

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

export interface WSMessage {
  type: string;
  data: any;
  timestamp: Date;
  channel?: string;
  userId?: string;
}

export interface WSClient {
  id: string;
  ws: WebSocket;
  userId?: string;
  channels: string[];
  connectedAt: Date;
  lastActivity: Date;
}

export class WebSocketServerManager extends EventEmitter {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WSClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private isRunning = false;
  private port: number;

  constructor(port: number = 8080) {
    super();
    this.port = port;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      this.wss = new WebSocketServer({ port: this.port });
      
      this.wss.on('connection', (ws: WebSocket) => {
        this.handleConnection(ws);
      });

      this.wss.on('error', (error) => {
        console.error('❌ Erro no WebSocket Server:', error);
        this.emit('error', error);
      });

      this.isRunning = true;
      console.log(`📡 WebSocket Server rodando na porta ${this.port}`);
      
      // Iniciar limpeza de clientes inativos
      this.startCleanupInterval();
      
      this.emit('started');
    } catch (error) {
      console.error('❌ Erro ao iniciar WebSocket Server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {
      // Desconectar todos os clientes
      this.clients.forEach(client => {
        client.ws.close(1000, 'Server shutting down');
      });

      // Fechar servidor
      if (this.wss) {
        this.wss.close();
        this.wss = null;
      }

      this.clients.clear();
      this.channels.clear();
      this.isRunning = false;
      
      console.log('📡 WebSocket Server parado');
      this.emit('stopped');
    } catch (error) {
      console.error('❌ Erro ao parar WebSocket Server:', error);
      throw error;
    }
  }

  private handleConnection(ws: WebSocket): void {
    const clientId = this.generateClientId();
    const client: WSClient = {
      id: clientId,
      ws,
      channels: [],
      connectedAt: new Date(),
      lastActivity: new Date()
    };

    this.clients.set(clientId, client);
    console.log(`🔌 Cliente conectado: ${clientId}`);

    ws.on('message', (data: Buffer) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnection(clientId, code, reason.toString());
    });

    ws.on('error', (error) => {
      console.error(`❌ Erro no cliente ${clientId}:`, error);
      this.handleDisconnection(clientId, 1006, 'Error');
    });

    // Enviar mensagem de boas-vindas
    this.sendToClient(clientId, {
      type: 'welcome',
      data: { clientId, message: 'Conectado ao RPA WebSocket Server' },
      timestamp: new Date()
    });

    this.emit('clientConnected', client);
  }

  private handleMessage(clientId: string, data: Buffer): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      const client = this.clients.get(clientId);
      
      if (!client) return;

      // Atualizar última atividade
      client.lastActivity = new Date();

      // Processar mensagem baseada no tipo
      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(clientId, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(clientId, message);
          break;
        case 'auth':
          this.handleAuth(clientId, message);
          break;
        case 'broadcast':
          this.handleBroadcast(clientId, message);
          break;
        default:
          this.emit('message', clientId, message);
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Erro ao processar mensagem' },
        timestamp: new Date()
      });
    }
  }

  private handleSubscribe(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const channel = message.data.channel;
    if (!channel) return;

    // Adicionar cliente ao canal
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    client.channels.push(channel);

    // Confirmar inscrição
    this.sendToClient(clientId, {
      type: 'subscribed',
      data: { channel },
      timestamp: new Date()
    });

    console.log(`📡 Cliente ${clientId} inscrito no canal: ${channel}`);
  }

  private handleUnsubscribe(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const channel = message.data.channel;
    if (!channel) return;

    // Remover cliente do canal
    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(clientId);
      if (channelClients.size === 0) {
        this.channels.delete(channel);
      }
    }

    client.channels = client.channels.filter(c => c !== channel);

    // Confirmar desinscrição
    this.sendToClient(clientId, {
      type: 'unsubscribed',
      data: { channel },
      timestamp: new Date()
    });

    console.log(`📡 Cliente ${clientId} desinscrito do canal: ${channel}`);
  }

  private handleAuth(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const userId = message.data.userId;
    if (userId) {
      client.userId = userId;
      
      this.sendToClient(clientId, {
        type: 'authenticated',
        data: { userId },
        timestamp: new Date()
      });

      console.log(`🔐 Cliente ${clientId} autenticado como usuário: ${userId}`);
    }
  }

  private handleBroadcast(clientId: string, message: WSMessage): void {
    const channel = message.data.channel;
    if (!channel) return;

    // Broadcast para todos no canal
    this.broadcastToChannel(channel, {
      type: 'broadcast',
      data: message.data,
      timestamp: new Date(),
      userId: this.clients.get(clientId)?.userId
    });
  }

  private handleDisconnection(clientId: string, code: number, reason: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remover de todos os canais
    client.channels.forEach(channel => {
      const channelClients = this.channels.get(channel);
      if (channelClients) {
        channelClients.delete(clientId);
        if (channelClients.size === 0) {
          this.channels.delete(channel);
        }
      }
    });

    this.clients.delete(clientId);
    console.log(`🔌 Cliente desconectado: ${clientId} (${code}: ${reason})`);
    this.emit('clientDisconnected', clientId, code, reason);
  }

  // 📤 MÉTODOS DE ENVIO
  sendToClient(clientId: string, message: WSMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem para ${clientId}:`, error);
    }
  }

  broadcastToChannel(channel: string, message: WSMessage): void {
    const channelClients = this.channels.get(channel);
    if (!channelClients) return;

    channelClients.forEach(clientId => {
      this.sendToClient(clientId, message);
    });
  }

  broadcastToAll(message: WSMessage): void {
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, message);
    });
  }

  sendToUser(userId: string, message: WSMessage): void {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  // 📊 MÉTRICAS
  getStats(): {
    totalClients: number;
    totalChannels: number;
    isRunning: boolean;
    uptime: number;
  } {
    return {
      totalClients: this.clients.size,
      totalChannels: this.channels.size,
      isRunning: this.isRunning,
      uptime: this.isRunning ? Date.now() - (this.wss?.listening ? Date.now() : 0) : 0
    };
  }

  getChannelInfo(channel: string): {
    subscribers: number;
    clientIds: string[];
  } | null {
    const channelClients = this.channels.get(channel);
    if (!channelClients) return null;

    return {
      subscribers: channelClients.size,
      clientIds: Array.from(channelClients)
    };
  }

  getClientInfo(clientId: string): WSClient | null {
    return this.clients.get(clientId) || null;
  }

  // 🧹 LIMPEZA
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupInactiveClients();
    }, 300000); // 5 minutos
  }

  private cleanupInactiveClients(): void {
    const now = Date.now();
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutos

    this.clients.forEach((client, clientId) => {
      if (now - client.lastActivity.getTime() > maxInactiveTime) {
        console.log(`🧹 Removendo cliente inativo: ${clientId}`);
        client.ws.close(1000, 'Inactive client');
        this.clients.delete(clientId);
      }
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 🎯 MÉTODOS ESPECÍFICOS PARA RPA
  sendRpaUpdate(userId: string, update: any): void {
    this.sendToUser(userId, {
      type: 'rpa_update',
      data: update,
      timestamp: new Date()
    });
  }

  broadcastRpaAlert(alert: any): void {
    this.broadcastToChannel('rpa_alerts', {
      type: 'rpa_alert',
      data: alert,
      timestamp: new Date()
    });
  }

  sendTaskStatus(taskId: string, status: any): void {
    this.broadcastToChannel('task_updates', {
      type: 'task_status',
      data: { taskId, ...status },
      timestamp: new Date()
    });
  }

  sendSystemMetrics(metrics: any): void {
    this.broadcastToChannel('system_metrics', {
      type: 'system_metrics',
      data: metrics,
      timestamp: new Date()
    });
  }
}

export { WebSocketServerManager as WebSocketServer };

// Exportar instância global
export const wss = new WebSocketServerManager(); 