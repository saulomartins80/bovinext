/***************************************
 * 📧 NOTIFICATION SERVICE - EMAILS E ALERTAS
 * (Sistema de notificações automáticas)
 ***************************************/

import { User } from '../models/User';
import winston from 'winston';

interface EmailTemplate {
  subject: string;
  body: string;
  html?: string;
}

interface AlertData {
  type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionUrl?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'notification' },
      transports: [
        new winston.transports.File({ filename: 'logs/notifications.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 📧 ENVIAR EMAIL
  async sendEmail(userId: string, template: EmailTemplate, data?: any): Promise<boolean> {
    try {
      // Buscar usuário
      const user = await User.findOne({ firebaseUid: userId });
      if (!user || !user.email) {
        this.logger.warn(`Usuário não encontrado ou sem email: ${userId}`);
        return false;
      }

      // Substituir variáveis no template
      const processedTemplate = this.processTemplate(template, data, user);

      // Enviar email (implementar serviço de email real)
      await this.sendEmailViaService(user.email, processedTemplate);

      this.logger.info(`📧 Email enviado para ${user.email}: ${processedTemplate.subject}`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Erro ao enviar email:`, error);
      return false;
    }
  }

  // 🚨 ENVIAR ALERTA
  async sendAlert(userId: string, alertData: AlertData): Promise<boolean> {
    try {
      // Buscar usuário
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        this.logger.warn(`Usuário não encontrado: ${userId}`);
        return false;
      }

      // Salvar alerta no banco
      await this.saveAlertToDatabase(userId, alertData);

      // Enviar notificação push se configurado
      await this.sendPushNotification(userId, alertData);

      // Enviar email se for crítico
      if (alertData.priority === 'CRITICAL') {
        await this.sendEmail(userId, {
          subject: `🚨 ALERTA CRÍTICO: ${alertData.title}`,
          body: alertData.message,
          html: this.generateAlertEmailHTML(alertData)
        });
      }

      this.logger.info(`🚨 Alerta enviado para ${userId}: ${alertData.title}`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Erro ao enviar alerta:`, error);
      return false;
    }
  }

  // 🎯 EMAILS ESPECÍFICOS PARA AÇÕES

  // Email de confirmação de meta
  async sendGoalConfirmationEmail(userId: string, goalData: any): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `🎯 Meta "${goalData.meta}" criada com sucesso!`,
      body: `
Olá!

Sua meta "${goalData.meta}" foi criada com sucesso!

📊 Detalhes da meta:
- Valor total: R$ ${goalData.valor_total.toFixed(2)}
- Prazo: ${goalData.data_conclusao}
- Categoria: ${goalData.categoria}

💡 Dicas para alcançar sua meta:
1. Configure lembretes mensais
2. Monitore o progresso regularmente
3. Ajuste o valor conforme necessário

Acesse o app para acompanhar seu progresso!

Abraços,
Equipe Finnextho
      `,
      html: this.generateGoalEmailHTML(goalData)
    };

    return await this.sendEmail(userId, template, goalData);
  }

  // Email de confirmação de transação
  async sendTransactionConfirmationEmail(userId: string, transactionData: any): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `💰 Transação "${transactionData.descricao}" registrada!`,
      body: `
Olá!

Sua transação foi registrada com sucesso!

📊 Detalhes da transação:
- Descrição: ${transactionData.descricao}
- Valor: R$ ${transactionData.valor.toFixed(2)}
- Tipo: ${transactionData.tipo}
- Categoria: ${transactionData.categoria}
- Data: ${transactionData.data}

💡 Dicas para manter o controle:
1. Revise suas transações semanalmente
2. Configure categorias automáticas
3. Defina limites de gastos

Acesse o app para ver seu histórico completo!

Abraços,
Equipe Finnextho
      `,
      html: this.generateTransactionEmailHTML(transactionData)
    };

    return await this.sendEmail(userId, template, transactionData);
  }

  // Email de confirmação de investimento
  async sendInvestmentConfirmationEmail(userId: string, investmentData: any): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `📈 Investimento "${investmentData.nome}" registrado!`,
      body: `
Olá!

Seu investimento foi registrado com sucesso!

📊 Detalhes do investimento:
- Nome: ${investmentData.nome}
- Valor: R$ ${investmentData.valor.toFixed(2)}
- Tipo: ${investmentData.tipo}
- Instituição: ${investmentData.instituicao || 'Não informada'}

💡 Dicas para seus investimentos:
1. Mantenha a diversificação
2. Revise periodicamente
3. Considere aumentar aportes

Acesse o app para ver seu portfólio completo!

Abraços,
Equipe Finnextho
      `,
      html: this.generateInvestmentEmailHTML(investmentData)
    };

    return await this.sendEmail(userId, template, investmentData);
  }

  // Email de relatório
  async sendReportEmail(userId: string, reportData: any): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `📄 Relatório ${reportData.type} - Finnextho`,
      body: `
Olá!

Seu relatório ${reportData.type} foi gerado com sucesso!

📊 Resumo do relatório:
- Tipo: ${reportData.type}
- Período: ${reportData.period || 'Atual'}
- Gerado em: ${new Date().toLocaleDateString()}

Acesse o app para visualizar o relatório completo!

Abraços,
Equipe Finnextho
      `,
      html: this.generateReportEmailHTML(reportData)
    };

    return await this.sendEmail(userId, template, reportData);
  }

  // 🚨 ALERTAS ESPECÍFICOS

  // Alerta de gastos altos
  async sendHighSpendingAlert(userId: string, spendingData: any): Promise<boolean> {
    const alertData: AlertData = {
      type: 'WARNING',
      title: '⚠️ Gastos Altos Detectados',
      message: `Seus gastos este mês estão ${spendingData.percentage}% acima da média. Considere revisar seu orçamento.`,
      priority: 'HIGH',
      actionUrl: '/dashboard'
    };

    return await this.sendAlert(userId, alertData);
  }

  // Alerta de meta próxima do prazo
  async sendGoalDeadlineAlert(userId: string, goalData: any): Promise<boolean> {
    const alertData: AlertData = {
      type: 'WARNING',
      title: '⏰ Prazo da Meta se Aproxima',
      message: `Sua meta "${goalData.meta}" vence em ${goalData.daysLeft} dias. Progresso atual: ${goalData.progress}%`,
      priority: 'MEDIUM',
      actionUrl: '/goals'
    };

    return await this.sendAlert(userId, alertData);
  }

  // Alerta de investimento com perda
  async sendInvestmentLossAlert(userId: string, investmentData: any): Promise<boolean> {
    const alertData: AlertData = {
      type: 'WARNING',
      title: '📉 Perda Detectada no Investimento',
      message: `Seu investimento "${investmentData.nome}" registrou perda de ${investmentData.lossPercentage}%. Considere revisar sua estratégia.`,
      priority: 'HIGH',
      actionUrl: '/investments'
    };

    return await this.sendAlert(userId, alertData);
  }

  // Alerta de sucesso
  async sendSuccessAlert(userId: string, title: string, message: string): Promise<boolean> {
    const alertData: AlertData = {
      type: 'SUCCESS',
      title,
      message,
      priority: 'LOW'
    };

    return await this.sendAlert(userId, alertData);
  }

  // Métodos privados auxiliares

  private processTemplate(template: EmailTemplate, data: any, user: any): EmailTemplate {
    let processedTemplate = { ...template };

    // Substituir variáveis comuns
    processedTemplate.subject = processedTemplate.subject
      .replace('{userName}', user.name || 'Usuário')
      .replace('{userEmail}', user.email);

    processedTemplate.body = processedTemplate.body
      .replace('{userName}', user.name || 'Usuário')
      .replace('{userEmail}', user.email);

    // Substituir variáveis específicas dos dados
    if (data) {
      Object.keys(data).forEach(key => {
        const value = data[key];
        const placeholder = `{${key}}`;
        
        processedTemplate.subject = processedTemplate.subject.replace(placeholder, String(value));
        processedTemplate.body = processedTemplate.body.replace(placeholder, String(value));
      });
    }

    return processedTemplate;
  }

  private async sendEmailViaService(email: string, template: EmailTemplate): Promise<void> {
    // TODO: Implementar serviço de email real (SendGrid, AWS SES, etc.)
    console.log(`📧 [SIMULAÇÃO] Email enviado para ${email}:`, {
      subject: template.subject,
      body: template.body.substring(0, 100) + '...'
    });
  }

  private async saveAlertToDatabase(userId: string, alertData: AlertData): Promise<void> {
    // TODO: Implementar salvamento no banco de dados
    console.log(`🚨 [SIMULAÇÃO] Alerta salvo no banco:`, {
      userId,
      ...alertData
    });
  }

  private async sendPushNotification(userId: string, alertData: AlertData): Promise<void> {
    // TODO: Implementar notificação push
    console.log(`📱 [SIMULAÇÃO] Push notification enviado:`, {
      userId,
      title: alertData.title,
      message: alertData.message
    });
  }

  private generateGoalEmailHTML(goalData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">🎯 Meta Criada com Sucesso!</h2>
        <p>Olá!</p>
        <p>Sua meta <strong>"${goalData.meta}"</strong> foi criada com sucesso!</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 Detalhes da Meta</h3>
          <p><strong>Valor total:</strong> R$ ${goalData.valor_total.toFixed(2)}</p>
          <p><strong>Prazo:</strong> ${goalData.data_conclusao}</p>
          <p><strong>Categoria:</strong> ${goalData.categoria}</p>
        </div>
        
        <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>💡 Dicas para Alcançar sua Meta</h3>
          <ul>
            <li>Configure lembretes mensais</li>
            <li>Monitore o progresso regularmente</li>
            <li>Ajuste o valor conforme necessário</li>
          </ul>
        </div>
        
        <p>Acesse o app para acompanhar seu progresso!</p>
        <p>Abraços,<br>Equipe Finnextho</p>
      </div>
    `;
  }

  private generateTransactionEmailHTML(transactionData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">💰 Transação Registrada!</h2>
        <p>Olá!</p>
        <p>Sua transação foi registrada com sucesso!</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 Detalhes da Transação</h3>
          <p><strong>Descrição:</strong> ${transactionData.descricao}</p>
          <p><strong>Valor:</strong> R$ ${transactionData.valor.toFixed(2)}</p>
          <p><strong>Tipo:</strong> ${transactionData.tipo}</p>
          <p><strong>Categoria:</strong> ${transactionData.categoria}</p>
          <p><strong>Data:</strong> ${transactionData.data}</p>
        </div>
        
        <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>💡 Dicas para Manter o Controle</h3>
          <ul>
            <li>Revise suas transações semanalmente</li>
            <li>Configure categorias automáticas</li>
            <li>Defina limites de gastos</li>
          </ul>
        </div>
        
        <p>Acesse o app para ver seu histórico completo!</p>
        <p>Abraços,<br>Equipe Finnextho</p>
      </div>
    `;
  }

  private generateInvestmentEmailHTML(investmentData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">📈 Investimento Registrado!</h2>
        <p>Olá!</p>
        <p>Seu investimento foi registrado com sucesso!</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 Detalhes do Investimento</h3>
          <p><strong>Nome:</strong> ${investmentData.nome}</p>
          <p><strong>Valor:</strong> R$ ${investmentData.valor.toFixed(2)}</p>
          <p><strong>Tipo:</strong> ${investmentData.tipo}</p>
          <p><strong>Instituição:</strong> ${investmentData.instituicao || 'Não informada'}</p>
        </div>
        
        <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>💡 Dicas para seus Investimentos</h3>
          <ul>
            <li>Mantenha a diversificação</li>
            <li>Revise periodicamente</li>
            <li>Considere aumentar aportes</li>
          </ul>
        </div>
        
        <p>Acesse o app para ver seu portfólio completo!</p>
        <p>Abraços,<br>Equipe Finnextho</p>
      </div>
    `;
  }

  private generateReportEmailHTML(reportData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7C3AED;">📄 Relatório Gerado!</h2>
        <p>Olá!</p>
        <p>Seu relatório foi gerado com sucesso!</p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📊 Detalhes do Relatório</h3>
          <p><strong>Tipo:</strong> ${reportData.type}</p>
          <p><strong>Período:</strong> ${reportData.period || 'Atual'}</p>
          <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>Acesse o app para visualizar o relatório completo!</p>
        <p>Abraços,<br>Equipe Finnextho</p>
      </div>
    `;
  }

  private generateAlertEmailHTML(alertData: AlertData): string {
    const colorMap = {
      SUCCESS: '#059669',
      WARNING: '#D97706',
      ERROR: '#DC2626',
      INFO: '#2563EB'
    };

    const color = colorMap[alertData.type] || '#6B7280';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">${alertData.title}</h2>
        <p>${alertData.message}</p>
        
        ${alertData.actionUrl ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${alertData.actionUrl}" style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Detalhes
            </a>
          </div>
        ` : ''}
        
        <p>Abraços,<br>Equipe Finnextho</p>
      </div>
    `;
  }
} 